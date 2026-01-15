# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-01-05
### Added
- Initial public repository setup.
- Community docs: LICENSE (MIT), CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.
- GitHub templates: issue templates and PR template.
- `.env.example` for environment configuration.

### Changed
- Switched hardcoded API URL to `VITE_API_BASE_URL`.

### Notes
- README includes Quick Start and architecture overview. Future tasks: CI, linting/formatting, and tests.

## [0.0.1] - 2026-01-10
### Added
This release introduces the first stable set of features and improvements for the plugin, focusing on **form building, field controls, layouts, validations, and usability**.

**Key highlights:**

* **Form Builder & Layouts**

  * Enhanced group layouts (icons, horizontal/vertical options) and improved group property handling.
  * Structural view improvements, including better support for arrays and nested fields.
  * UI refinements such as draggable panels, dialog confirmations, and preview mode enhancements.

* **Field Types & Controls**

  * Added new field types including file upload, password, URL, currency, date/time, and array variants.
  * Expanded multi-select capabilities (chips/checkbox display, multiple defaults, show more options).
  * Improved custom controls with readonly support and better formatting options.

* **Validations & Defaults**

  * Added and refined validations for files, email, URLs, dates, arrays, and multi-select fields.
  * Support for default values in preview mode and reset-to-default behavior.
  * Min/max and item count validations across relevant field types.

* **Data & Options Handling**

  * Improvements to enum handling, dropdowns, and option display.
  * Added (and later refined) dynamic data handling for select options.
  * Better handling of nested arrays and enum value consistency.

Overall, this release establishes a solid foundation with broad field support, flexible layouts, and improved validation and preview workflows.

### Notes
- Bumped package version to `0.0.2` for release.

## [0.0.3] - 2026-01-15
### Added
- Explicit registry bootstrap API (`bootstrapDefaultFieldTypes`) and app-level initialization.
- Unit test verifying registry behavior (`src/__tests__/Registry.test.jsx`).

### Changed
- Removed automatic package-level side-effects; registry initialization is now explicit and deterministic.
- Public API cleaned: `bootstrapDefaultFieldTypes` is no longer exported from package root.

### Notes
- Bumped package version to `0.0.3` for release.