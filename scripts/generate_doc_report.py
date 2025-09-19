#!/usr/bin/env python3
"""
Documentation report generator for Journal application.
Generates comprehensive HTML and JSON reports for documentation quality.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List
from datetime import datetime
from html import escape

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import other validation scripts
from scripts.validate_docs import DocumentValidator
from scripts.check_doc_coverage import DocumentationCoverageChecker


class DocumentationReportGenerator:
    """Generates comprehensive documentation reports."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.docs_dir = project_root / "docs"
        self.report_dir = self.docs_dir / "_generated" / "reports"
        self.report_dir.mkdir(parents=True, exist_ok=True)

        # Initialize validators
        self.validator = DocumentValidator(self.docs_dir / "schemas", self.docs_dir)
        self.coverage_checker = DocumentationCoverageChecker(project_root)

    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive documentation report."""
        print("Generating documentation report...")

        # Run validation
        print("  Running schema validation...")
        validation_results = self.validator.validate_all()

        # Run coverage check
        print("  Checking coverage...")
        coverage_data = self.coverage_checker.check_coverage()

        # Compile report data
        report_data = {
            "generated_at": datetime.now().isoformat(),
            "project_root": str(self.project_root),
            "summary": self._generate_summary(validation_results, coverage_data),
            "validation": self._process_validation_results(validation_results),
            "coverage": coverage_data,
            "recommendations": self._generate_recommendations(
                validation_results, coverage_data
            ),
        }

        # Save JSON report
        json_file = self.report_dir / "documentation_report.json"
        with open(json_file, "w") as f:
            json.dump(report_data, f, indent=2, default=str)
        print(f"  JSON report saved to: {json_file.relative_to(self.project_root)}")

        # Generate HTML report
        html_file = self.report_dir / "documentation_report.html"
        self._generate_html_report(report_data, html_file)
        print(f"  HTML report saved to: {html_file.relative_to(self.project_root)}")

        # Generate markdown summary
        md_file = self.report_dir / "documentation_summary.md"
        self._generate_markdown_summary(report_data, md_file)
        print(f"  Markdown summary saved to: {md_file.relative_to(self.project_root)}")

        return report_data

    def _generate_summary(
        self, validation_results: List, coverage_data: Dict
    ) -> Dict[str, Any]:
        """Generate summary statistics."""
        total_docs = len(validation_results)
        valid_docs = sum(1 for r in validation_results if r.is_valid)
        docs_with_warnings = sum(1 for r in validation_results if r.warnings)

        # Calculate average metrics
        avg_completeness = (
            sum(r.metrics.get("completeness", 0) for r in validation_results)
            / total_docs
            if total_docs
            else 0
        )
        avg_structure = (
            sum(r.metrics.get("structure_score", 0) for r in validation_results)
            / total_docs
            if total_docs
            else 0
        )
        avg_freshness = (
            sum(r.metrics.get("freshness", 0) for r in validation_results) / total_docs
            if total_docs
            else 0
        )

        return {
            "total_documents": total_docs,
            "valid_documents": valid_docs,
            "documents_with_errors": total_docs - valid_docs,
            "documents_with_warnings": docs_with_warnings,
            "validation_pass_rate": (valid_docs / total_docs * 100)
            if total_docs
            else 0,
            "average_completeness": avg_completeness,
            "average_structure_score": avg_structure,
            "average_freshness": avg_freshness,
            "api_coverage": coverage_data["summary"].get("api_coverage", 0),
            "component_coverage": coverage_data["summary"].get("component_coverage", 0),
            "overall_health": coverage_data["summary"].get("overall_health", 0),
        }

    def _process_validation_results(self, results: List) -> Dict[str, Any]:
        """Process validation results for reporting."""
        return {
            "total": len(results),
            "passed": [
                {
                    "file": str(r.file_path.relative_to(self.project_root)),
                    "metrics": r.metrics,
                }
                for r in results
                if r.is_valid
            ],
            "failed": [
                {
                    "file": str(r.file_path.relative_to(self.project_root)),
                    "errors": r.errors,
                    "warnings": r.warnings,
                    "metrics": r.metrics,
                }
                for r in results
                if not r.is_valid
            ],
            "warnings": [
                {
                    "file": str(r.file_path.relative_to(self.project_root)),
                    "warnings": r.warnings,
                }
                for r in results
                if r.warnings
            ],
        }

    def _generate_recommendations(
        self, validation_results: List, coverage_data: Dict
    ) -> List[Dict]:
        """Generate actionable recommendations."""
        recommendations = []

        # Check validation pass rate
        pass_rate = (
            sum(1 for r in validation_results if r.is_valid)
            / len(validation_results)
            * 100
            if validation_results
            else 0
        )
        if pass_rate < 80:
            recommendations.append(
                {
                    "priority": "high",
                    "category": "validation",
                    "issue": f"Low validation pass rate ({pass_rate:.1f}%)",
                    "action": "Fix schema validation errors in failing documents",
                }
            )

        # Check API coverage
        api_coverage = coverage_data["summary"].get("api_coverage", 0)
        if api_coverage < 90:
            recommendations.append(
                {
                    "priority": "high",
                    "category": "coverage",
                    "issue": f"Incomplete API documentation ({api_coverage:.1f}%)",
                    "action": "Document all API endpoints in /docs/api/v1/",
                }
            )

        # Check for outdated documents
        outdated_count = coverage_data["summary"].get("outdated_documents", 0)
        if outdated_count > 5:
            recommendations.append(
                {
                    "priority": "medium",
                    "category": "freshness",
                    "issue": f"{outdated_count} outdated documents",
                    "action": "Update documents older than their freshness threshold",
                }
            )

        # Check for missing frontmatter
        incomplete = coverage_data.get("incomplete", {}).get("frontmatter", [])
        if len(incomplete) > 10:
            recommendations.append(
                {
                    "priority": "medium",
                    "category": "metadata",
                    "issue": f"{len(incomplete)} documents missing required frontmatter",
                    "action": "Add complete YAML frontmatter to all documents",
                }
            )

        # Check component coverage
        component_coverage = coverage_data["summary"].get("component_coverage", 0)
        if component_coverage < 70:
            recommendations.append(
                {
                    "priority": "low",
                    "category": "coverage",
                    "issue": f"Low component documentation ({component_coverage:.1f}%)",
                    "action": "Create documentation for React components",
                }
            )

        return recommendations

    def _generate_html_report(self, report_data: Dict, output_file: Path):
        """Generate HTML report."""
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Journal Documentation Report</title>
    <style>
        :root {{
            --primary: #3b82f6;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --bg: #f9fafb;
            --card: #ffffff;
            --text: #111827;
            --text-light: #6b7280;
        }}
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }}
        h1 {{
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: var(--primary);
        }}
        .timestamp {{
            color: var(--text-light);
            font-size: 0.875rem;
            margin-bottom: 2rem;
        }}
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }}
        .metric-card {{
            background: var(--card);
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        .metric-label {{
            font-size: 0.875rem;
            color: var(--text-light);
            margin-bottom: 0.5rem;
        }}
        .metric-value {{
            font-size: 2rem;
            font-weight: bold;
        }}
        .metric-value.good {{ color: var(--success); }}
        .metric-value.warning {{ color: var(--warning); }}
        .metric-value.error {{ color: var(--error); }}
        .section {{
            background: var(--card);
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        .section h2 {{
            margin-bottom: 1rem;
            color: var(--primary);
        }}
        .recommendations {{
            list-style: none;
        }}
        .recommendation {{
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            border-left: 3px solid;
            background: var(--bg);
        }}
        .recommendation.high {{ border-color: var(--error); }}
        .recommendation.medium {{ border-color: var(--warning); }}
        .recommendation.low {{ border-color: var(--success); }}
        .priority {{
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: bold;
            text-transform: uppercase;
            margin-right: 0.5rem;
        }}
        .priority.high {{ background: var(--error); color: white; }}
        .priority.medium {{ background: var(--warning); color: white; }}
        .priority.low {{ background: var(--success); color: white; }}
        .error-list {{
            list-style: none;
            margin-top: 1rem;
        }}
        .error-item {{
            padding: 0.5rem;
            background: #fef2f2;
            border-left: 3px solid var(--error);
            margin-bottom: 0.5rem;
        }}
        .warning-item {{
            padding: 0.5rem;
            background: #fffbeb;
            border-left: 3px solid var(--warning);
            margin-bottom: 0.5rem;
        }}
        .progress-bar {{
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 0.5rem;
        }}
        .progress-fill {{
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--success));
            transition: width 0.3s ease;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Journal Documentation Report</h1>
        <div class="timestamp">Generated: {escape(report_data["generated_at"])}</div>

        <div class="summary-grid">
            <div class="metric-card">
                <div class="metric-label">Total Documents</div>
                <div class="metric-value">{report_data["summary"]["total_documents"]}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Validation Pass Rate</div>
                <div class="metric-value {self._get_status_class(report_data["summary"]["validation_pass_rate"])}">{report_data["summary"]["validation_pass_rate"]:.1f}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {report_data["summary"]["validation_pass_rate"]}%"></div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">API Coverage</div>
                <div class="metric-value {self._get_status_class(report_data["summary"]["api_coverage"])}">{report_data["summary"]["api_coverage"]:.1f}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {report_data["summary"]["api_coverage"]}%"></div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Overall Health</div>
                <div class="metric-value {self._get_status_class(report_data["summary"]["overall_health"])}">{report_data["summary"]["overall_health"]:.1f}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {report_data["summary"]["overall_health"]}%"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📋 Recommendations</h2>
            <ul class="recommendations">
                {"".join(self._format_recommendation_html(r) for r in report_data["recommendations"])}
            </ul>
        </div>

        <div class="section">
            <h2>❌ Validation Errors ({len(report_data["validation"]["failed"])})</h2>
            <ul class="error-list">
                {"".join(self._format_error_html(e) for e in report_data["validation"]["failed"][:10])}
            </ul>
        </div>

        <div class="section">
            <h2>⚠️ Coverage Issues</h2>
            {self._format_coverage_html(report_data["coverage"])}
        </div>
    </div>
</body>
</html>"""
        with open(output_file, "w") as f:
            f.write(html)

    def _generate_markdown_summary(self, report_data: Dict, output_file: Path):
        """Generate markdown summary."""
        md_content = f"""# Documentation Report Summary

Generated: {report_data["generated_at"]}

## 📊 Overview

- **Total Documents**: {report_data["summary"]["total_documents"]}
- **Valid Documents**: {report_data["summary"]["valid_documents"]}
- **Validation Pass Rate**: {report_data["summary"]["validation_pass_rate"]:.1f}%
- **API Coverage**: {report_data["summary"]["api_coverage"]:.1f}%
- **Component Coverage**: {report_data["summary"]["component_coverage"]:.1f}%
- **Overall Health**: {report_data["summary"]["overall_health"]:.1f}%

## 🎯 Key Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Average Completeness | {report_data["summary"]["average_completeness"]:.1f}% | {self._get_status_emoji(report_data["summary"]["average_completeness"])} |
| Average Structure Score | {report_data["summary"]["average_structure_score"]:.1f}% | {self._get_status_emoji(report_data["summary"]["average_structure_score"])} |
| Average Freshness | {report_data["summary"]["average_freshness"]:.1f}% | {self._get_status_emoji(report_data["summary"]["average_freshness"])} |

## 📋 Top Recommendations

"""
        for rec in report_data["recommendations"][:5]:
            md_content += f"### {rec['priority'].upper()}: {rec['issue']}\n"
            md_content += f"**Action**: {rec['action']}\n\n"

        md_content += """## 📈 Trends

- Documents with errors: {documents_with_errors}
- Documents with warnings: {documents_with_warnings}
- Outdated documents: {outdated_documents}
- Incomplete documents: {incomplete_documents}

## 📝 Next Steps

1. Fix validation errors in failing documents
2. Add missing frontmatter to incomplete documents
3. Update outdated documentation
4. Document missing API endpoints
5. Review and implement recommendations

---

*Full report available at: `docs/_generated/reports/documentation_report.html`*
""".format(
            documents_with_errors=report_data["summary"]["documents_with_errors"],
            documents_with_warnings=report_data["summary"]["documents_with_warnings"],
            outdated_documents=report_data["coverage"]["summary"].get(
                "outdated_documents", 0
            ),
            incomplete_documents=report_data["coverage"]["summary"].get(
                "incomplete_documents", 0
            ),
        )

        with open(output_file, "w") as f:
            f.write(md_content)

    def _get_status_class(self, value: float) -> str:
        """Get CSS class based on value."""
        if value >= 80:
            return "good"
        elif value >= 60:
            return "warning"
        return "error"

    def _get_status_emoji(self, value: float) -> str:
        """Get emoji based on value."""
        if value >= 80:
            return "✅"
        elif value >= 60:
            return "⚠️"
        return "❌"

    def _format_recommendation_html(self, rec: Dict) -> str:
        """Format recommendation as HTML."""
        return f"""
        <li class="recommendation {rec["priority"]}">
            <span class="priority {rec["priority"]}">{rec["priority"]}</span>
            <strong>{escape(rec["issue"])}</strong><br>
            {escape(rec["action"])}
        </li>
        """

    def _format_error_html(self, error: Dict) -> str:
        """Format error as HTML."""
        if not error["errors"]:
            return ""
        return f"""
        <li class="error-item">
            <strong>{escape(error["file"])}</strong><br>
            {escape(error["errors"][0]) if error["errors"] else ""}
        </li>
        """

    def _format_coverage_html(self, coverage: Dict) -> str:
        """Format coverage issues as HTML."""
        html = ""

        # API coverage
        if coverage.get("api_coverage", {}).get("undocumented"):
            html += "<h3>Undocumented API Endpoints</h3><ul>"
            for endpoint in coverage["api_coverage"]["undocumented"][:5]:
                html += f"<li>{escape(endpoint)}</li>"
            html += "</ul>"

        # Missing topics
        if coverage.get("missing"):
            html += "<h3>Missing Documentation Topics</h3><ul>"
            for doc_type, topics in list(coverage["missing"].items())[:3]:
                if topics:
                    html += f"<li><strong>{escape(doc_type)}:</strong> {escape(', '.join(topics))}</li>"
            html += "</ul>"

        return html or "<p>No major coverage issues found.</p>"


def main():
    """Main function."""
    project_root = Path(__file__).parent.parent
    generator = DocumentationReportGenerator(project_root)

    report_data = generator.generate_report()

    # Print summary to console
    print("\n" + "=" * 60)
    print("Documentation Report Summary")
    print("=" * 60)
    summary = report_data["summary"]
    print(f"Total Documents: {summary['total_documents']}")
    print(f"Validation Pass Rate: {summary['validation_pass_rate']:.1f}%")
    print(f"API Coverage: {summary['api_coverage']:.1f}%")
    print(f"Overall Health: {summary['overall_health']:.1f}%")

    if report_data["recommendations"]:
        print("\n📋 Top Recommendations:")
        for rec in report_data["recommendations"][:3]:
            print(f"  [{rec['priority'].upper()}] {rec['issue']}")
            print(f"    → {rec['action']}")

    print("\n✅ Reports generated in: docs/_generated/reports/")


if __name__ == "__main__":
    main()
