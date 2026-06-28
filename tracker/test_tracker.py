import unittest
import os
import sys

# Add script's parent folder to path to allow modules import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import tracker
from utils import parser
from utils import reporter

class TestTracker(unittest.TestCase):

    def test_strip_comments_line_comment(self):
        code = "val x = 1 // this is a line comment\nval y = 2"
        expected = "val x = 1 \nval y = 2"
        self.assertEqual(parser.strip_comments(code), expected)

    def test_strip_comments_block_comment(self):
        code = "val x = 1 /* block comment */\nval y = 2"
        expected = "val x = 1 \nval y = 2"
        self.assertEqual(parser.strip_comments(code), expected)

    def test_strip_comments_kdoc_comment(self):
        code = "/**\n * KDoc comment\n */\nfun foo() {}"
        expected = "\n\n\nfun foo() {}"
        self.assertEqual(parser.strip_comments(code), expected)

    def test_strip_comments_in_strings(self):
        # Comments inside strings should not be stripped
        code = 'val url = "https://google.com"\nval multi = """ // not a comment \n /* keep me */ """'
        self.assertEqual(parser.strip_comments(code), code)

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
            "\n"
            "fun main() {}"
        )
        self.assertEqual(parser.clean_imports_and_comments(code), expected)

    def test_extract_package(self):
        code = "// some comment\npackage com.example.compose\n\nfun test() {}"
        self.assertEqual(parser.extract_package(code), "com.example.compose")

        code_no_package = "fun test() {}"
        self.assertEqual(parser.extract_package(code_no_package), "")

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
        composables = parser.extract_composables(code)
        # PrimaryButton, InternalButton, CustomButton should be extracted.
        self.assertIn("PrimaryButton", composables)
        self.assertIn("InternalButton", composables)
        self.assertIn("CustomButton", composables)
        self.assertNotIn("PrimaryButtonPreview", composables)
        self.assertNotIn("PrivateHelper", composables)
        self.assertEqual(len(composables), 3)

    def test_write_reports(self):
        import tempfile
        import shutil
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
                    'ref_classes': [
                        {'class_name': 'com.domain.home.HomeActivity', 'source_set': 'main', 'module_name': 'app', 'count': 2, 'lines': [10, 25]},
                        {'class_name': 'com.domain.settings.SettingsActivity', 'source_set': 'main', 'module_name': 'app', 'count': 1, 'lines': [40]}
                    ]
                },
                {
                    'name': 'SecondaryButton',
                    'package': 'com.common.compose.button',
                    'defining_file': os.path.abspath('dummy_project/common/compose/Buttons.kt'),
                    'ref_count': 0,
                    'ref_classes': []
                }
            ]

            reporter.write_reports(temp_dir, "TestProj", "2026-06-27 19:44:00", "20260627_194400", components, "main-branch")

            # Check JSON report in summary_daily/20260627/
            report_path = os.path.join(temp_dir, "summary_daily", "20260627", "report.json")
            self.assertTrue(os.path.exists(report_path))
            with open(report_path, 'r', encoding='utf-8') as f:
                import json
                report = json.load(f)
                self.assertEqual(report["timestamp"], "20260627")
                self.assertEqual(report["date"], "2026-06-27 19:44:00")
                self.assertEqual(report["project_name"], "TestProj")
                self.assertEqual(report["branch"], "main-branch")
                self.assertEqual(report["summary"]["total_components"], 2)
                self.assertEqual(report["summary"]["active_components"], 1)
                self.assertEqual(report["summary"]["unused_components"], 1)
                self.assertEqual(report["summary"]["total_references"], 3)
                self.assertEqual(report["modules"], {"app": 3})
                
            # Check index.json in summary_daily/20260627/
            index_path = os.path.join(temp_dir, "summary_daily", "20260627", "index.json")
            self.assertTrue(os.path.exists(index_path))
            with open(index_path, 'r', encoding='utf-8') as f:
                components_list = json.load(f)
                self.assertEqual(len(components_list), 2)
                self.assertEqual(components_list[0]["name"], "PrimaryButton")
                self.assertEqual(components_list[0]["file"], "Buttons.kt")
                self.assertEqual(components_list[0]["count"], 3)

            # Check Buttons.json in summary_daily/20260627/
            buttons_path = os.path.join(temp_dir, "summary_daily", "20260627", "Buttons.json")
            self.assertTrue(os.path.exists(buttons_path))
            with open(buttons_path, 'r', encoding='utf-8') as f:
                buttons = json.load(f)
                self.assertEqual(buttons["package"], "com.common.compose.button")
                self.assertEqual(buttons["file"], "Buttons.kt")
                self.assertEqual(len(buttons["components"]), 2)
                self.assertEqual(buttons["components"][0]["name"], "PrimaryButton")
                self.assertEqual(buttons["components"][0]["count"], 3)
                self.assertEqual(buttons["components"][0]["classes"], [
                    {"class_name": "com.domain.home.HomeActivity", "source_set": "main", "module_name": "app", "count": 2, "lines": [10, 25]},
                    {"class_name": "com.domain.settings.SettingsActivity", "source_set": "main", "module_name": "app", "count": 1, "lines": [40]}
                ])

            # Check root index.json in summary_daily
            daily_index = os.path.join(temp_dir, "summary_daily", "index.json")
            self.assertTrue(os.path.exists(daily_index))
            with open(daily_index, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.assertEqual(data["project_name"], "TestProj")
                self.assertEqual(data["branch"], "main-branch")
                entries = data["runs"]
                self.assertEqual(len(entries), 1)
                self.assertEqual(entries[0]["timestamp"], "20260627")
                self.assertEqual(entries[0]["summary"]["total_components"], 2)
                self.assertEqual(entries[0]["modules"], {"app": 3})

            # Check weekly index and folder
            weekly_index = os.path.join(temp_dir, "summary_weekly", "index.json")
            self.assertTrue(os.path.exists(weekly_index))
            with open(weekly_index, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.assertEqual(data["project_name"], "TestProj")
                self.assertEqual(data["branch"], "main-branch")
                entries = data["runs"]
                self.assertEqual(len(entries), 1)
                self.assertEqual(entries[0]["timestamp"], "2026_W25")
                self.assertEqual(entries[0]["modules"], {"app": 3})
            self.assertTrue(os.path.exists(os.path.join(temp_dir, "summary_weekly", "2026_W25", "report.json")))
            
            # Check monthly index
            monthly_index = os.path.join(temp_dir, "summary_monthly", "index.json")
            self.assertTrue(os.path.exists(monthly_index))
            
            # Check yearly index
            yearly_index = os.path.join(temp_dir, "summary_yearly", "index.json")
            self.assertTrue(os.path.exists(yearly_index))

        finally:
            shutil.rmtree(temp_dir)

    def test_extract_source_set(self):
        # 1. Standard path under main sourceSet
        path_main = "C:\\Project\\app\\src\\main\\java\\com\\domain\\auth\\LoginActivity.kt"
        self.assertEqual(parser.extract_source_set(path_main), "main")

        # 2. Variant path (kr)
        path_kr = "/Users/username/Project/app/src/kr/kotlin/com/domain/auth/LoginActivity.kt"
        self.assertEqual(parser.extract_source_set(path_kr), "kr")

        # 3. Path without package name
        path_no_pkg = "C:\\Project\\app\\src\\us\\java\\MainActivity.kt"
        self.assertEqual(parser.extract_source_set(path_no_pkg), "us")

        # 4. Standard path with no sourceSet structure
        path_simple = "C:\\Project\\MainActivity.kt"
        self.assertEqual(parser.extract_source_set(path_simple), "main")

    def test_extract_module_name(self):
        project_path = "C:\\Projects\\dummy_project"
        
        # 1. Single module under app
        path_app = "C:\\Projects\\dummy_project\\app\\src\\main\\java\\com\\domain\\auth\\LoginActivity.kt"
        self.assertEqual(parser.extract_module_name(path_app, project_path), "app")

        # 2. Multi-module nested path (vas/dpaper)
        path_multi = "C:\\Projects\\dummy_project\\vas\\dpaper\\src\\main\\java\\com\\domain\\auth\\LoginActivity.kt"
        self.assertEqual(parser.extract_module_name(path_multi, project_path), "vas/dpaper")

        # 3. Path outside or no src folder (fallback)
        path_fallback = "C:\\Projects\\dummy_project\\app\\MainActivity.kt"
        self.assertEqual(parser.extract_module_name(path_fallback, project_path), "app")

if __name__ == '__main__':
    unittest.main()
