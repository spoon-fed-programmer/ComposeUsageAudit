import unittest
import tracker

class TestTracker(unittest.TestCase):

    def test_strip_comments_line_comment(self):
        code = "val x = 1 // this is a line comment\nval y = 2"
        expected = "val x = 1 \nval y = 2"
        self.assertEqual(tracker.strip_comments(code), expected)

    def test_strip_comments_block_comment(self):
        code = "val x = 1 /* block comment */\nval y = 2"
        expected = "val x = 1 \nval y = 2"
        self.assertEqual(tracker.strip_comments(code), expected)

    def test_strip_comments_kdoc_comment(self):
        code = "/**\n * KDoc comment\n */\nfun foo() {}"
        expected = "\nfun foo() {}"
        self.assertEqual(tracker.strip_comments(code), expected)

    def test_strip_comments_in_strings(self):
        # Comments inside strings should not be stripped
        code = 'val url = "https://google.com"\nval multi = """ // not a comment \n /* keep me */ """'
        self.assertEqual(tracker.strip_comments(code), code)

    def test_clean_imports_and_comments(self):
        code = (
            "package com.example\n"
            "import com.common.compose.PrimaryButton\n"
            "// A comment\n"
            "fun main() {}"
        )
        expected = (
            "package com.example\n"
            "\n"
            "fun main() {}"
        )
        self.assertEqual(tracker.clean_imports_and_comments(code), expected)

    def test_extract_package(self):
        code = "// some comment\npackage com.example.compose\n\nfun test() {}"
        self.assertEqual(tracker.extract_package(code), "com.example.compose")

        code_no_package = "fun test() {}"
        self.assertEqual(tracker.extract_package(code_no_package), "")

    def test_extract_composables(self):
        code = """
        @Composable
        fun PrimaryButton() {
        }
        
        @Composable
        @Preview
        fun PrimaryButtonPreview() {}
        
        @Composable
        private fun PrivateHelper() {}
        
        @Composable
        internal fun InternalButton() {}
        
        @Composable
        @OptIn(ExperimentalMaterial3Api::class)
        fun CustomButton() {}
        """
        composables = tracker.extract_composables(code)
        # PrimaryButton, InternalButton, CustomButton should be extracted.
        # PrimaryButtonPreview (annotated with @Preview) should be excluded.
        # PrivateHelper (private modifier) should be excluded.
        self.assertIn("PrimaryButton", composables)
        self.assertIn("InternalButton", composables)
        self.assertIn("CustomButton", composables)
        self.assertNotIn("PrimaryButtonPreview", composables)
        self.assertNotIn("PrivateHelper", composables)
        self.assertEqual(len(composables), 3)

    def test_write_reports(self):
        import tempfile
        import shutil
        import csv
        import os

        # Setup temp report dir
        temp_dir = tempfile.mkdtemp()
        try:
            components = [
                {
                    'name': 'PrimaryButton',
                    'package': 'com.common.compose.button',
                    'defining_file': os.path.abspath('dummy_project/common/compose/Buttons.kt'),
                    'ref_count': 3,
                    'ref_classes': ['com.domain.home.HomeActivity', 'com.domain.settings.SettingsActivity']
                },
                {
                    'name': 'SecondaryButton',
                    'package': 'com.common.compose.button',
                    'defining_file': os.path.abspath('dummy_project/common/compose/Buttons.kt'),
                    'ref_count': 0,
                    'ref_classes': []
                }
            ]

            tracker.write_reports(temp_dir, "TestProj", "2026-06-27 19:44:00", "20260627_194400", components, "main-branch")

            # Check JSON report in summary_daily/20260627_194400/
            report_path = os.path.join(temp_dir, "summary_daily", "20260627_194400", "report.json")
            self.assertTrue(os.path.exists(report_path))
            with open(report_path, 'r', encoding='utf-8') as f:
                import json
                report = json.load(f)
                self.assertEqual(report["timestamp"], "20260627_194400")
                self.assertEqual(report["date"], "2026-06-27 19:44:00")
                self.assertEqual(report["project_name"], "TestProj")
                self.assertEqual(report["branch"], "main-branch")
                self.assertEqual(report["summary"]["total_components"], 2)
                self.assertEqual(report["summary"]["active_components"], 1)
                self.assertEqual(report["summary"]["unused_components"], 1)
                self.assertEqual(report["summary"]["total_references"], 3)
                
            # Check index.json in summary_daily/20260627_194400/
            index_path = os.path.join(temp_dir, "summary_daily", "20260627_194400", "index.json")
            self.assertTrue(os.path.exists(index_path))
            with open(index_path, 'r', encoding='utf-8') as f:
                components_list = json.load(f)
                self.assertEqual(len(components_list), 2)
                self.assertEqual(components_list[0]["name"], "PrimaryButton")
                self.assertEqual(components_list[0]["file"], "Buttons.kt")
                self.assertEqual(components_list[0]["count"], 3)

            # Check Buttons.json in summary_daily/20260627_194400/
            buttons_path = os.path.join(temp_dir, "summary_daily", "20260627_194400", "Buttons.json")
            self.assertTrue(os.path.exists(buttons_path))
            with open(buttons_path, 'r', encoding='utf-8') as f:
                buttons = json.load(f)
                self.assertEqual(buttons["package"], "com.common.compose.button")
                self.assertEqual(buttons["file"], "Buttons.kt")
                self.assertEqual(len(buttons["components"]), 2)
                self.assertEqual(buttons["components"][0]["name"], "PrimaryButton")
                self.assertEqual(buttons["components"][0]["count"], 3)
                self.assertEqual(buttons["components"][0]["classes"], ["com.domain.home.HomeActivity", "com.domain.settings.SettingsActivity"])

            # Check root index.json in summary_daily
            daily_index = os.path.join(temp_dir, "summary_daily", "index.json")
            self.assertTrue(os.path.exists(daily_index))
            with open(daily_index, 'r', encoding='utf-8') as f:
                entries = json.load(f)
                self.assertEqual(len(entries), 1)
                self.assertEqual(entries[0]["timestamp"], "20260627_194400")
                self.assertEqual(entries[0]["summary"]["total_components"], 2)

            # Check weekly index and folder
            weekly_index = os.path.join(temp_dir, "summary_weekly", "index.json")
            self.assertTrue(os.path.exists(weekly_index))
            with open(weekly_index, 'r', encoding='utf-8') as f:
                entries = json.load(f)
                self.assertEqual(len(entries), 1)
                self.assertEqual(entries[0]["timestamp"], "2026_W25")
            self.assertTrue(os.path.exists(os.path.join(temp_dir, "summary_weekly", "2026_W25", "report.json")))
            
            # Check monthly index
            monthly_index = os.path.join(temp_dir, "summary_monthly", "index.json")
            self.assertTrue(os.path.exists(monthly_index))
            
            # Check yearly index
            yearly_index = os.path.join(temp_dir, "summary_yearly", "index.json")
            self.assertTrue(os.path.exists(yearly_index))

        finally:
            shutil.rmtree(temp_dir)

if __name__ == '__main__':
    unittest.main()
