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

            report_dir = os.path.join(temp_dir, "20260627_194400")
            tracker.write_reports(report_dir, "TestProj", "2026-06-27 19:44:00", components, "main-branch")

            # Check summary.csv
            summary_path = os.path.join(report_dir, "summary.csv")
            self.assertTrue(os.path.exists(summary_path))
            with open(summary_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                rows = list(reader)
                self.assertEqual(rows[0], ["Metric", "Value"])
                self.assertEqual(rows[1], ["Project Name", "TestProj"])
                self.assertEqual(rows[2], ["Git Branch", "main-branch"])
                self.assertEqual(rows[4], ["Total Components", "2"])
                self.assertEqual(rows[5], ["Active Components", "1"])
                self.assertEqual(rows[6], ["Unused Components", "1"])
                self.assertEqual(rows[7], ["Total References", "3"])
                self.assertEqual(rows[8], [])
                self.assertEqual(rows[9], ["File", "Component", "Reference Count"])
                self.assertEqual(rows[10], ["Buttons.kt", "PrimaryButton", "3"])
                self.assertEqual(rows[11], ["Buttons.kt", "SecondaryButton", "0"])

            # Check Buttons.csv
            buttons_path = os.path.join(report_dir, "Buttons.csv")
            self.assertTrue(os.path.exists(buttons_path))
            with open(buttons_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                rows = list(reader)
                self.assertEqual(rows[0], ["Package", "com.common.compose.button"])
                self.assertEqual(rows[1], ["File", "Buttons.kt"])
                self.assertEqual(rows[3], ["Component", "PrimaryButton"])
                self.assertEqual(rows[4], ["Reference Count", "3"])
                self.assertEqual(rows[5], ["Referenced Class"])
                self.assertEqual(rows[6], ["com.domain.home.HomeActivity"])
                self.assertEqual(rows[7], ["com.domain.settings.SettingsActivity"])

            # Check latest_reports.json in the parent (temp_dir)
            index_path = os.path.join(temp_dir, "latest_reports.json")
            self.assertTrue(os.path.exists(index_path))
            with open(index_path, 'r', encoding='utf-8') as f:
                import json
                entries = json.load(f)
                self.assertIsInstance(entries, list)
                self.assertEqual(len(entries), 1)
                self.assertEqual(entries[0]["timestamp"], "20260627_194400")
                self.assertEqual(entries[0]["project_name"], "TestProj")
                self.assertEqual(entries[0]["branch"], "main-branch")
                self.assertEqual(entries[0]["summary"]["total_components"], 2)
                self.assertEqual(entries[0]["files"], ["Buttons.csv"])

        finally:
            shutil.rmtree(temp_dir)

if __name__ == '__main__':
    unittest.main()
