# Single-Step Procedures

Format applicability: [All]
Modular Documentation Reference Guide: Section 3.1.2
Severity: **Must-fix**

## Rule

Use a **bullet point** (not a numbered step) for:
- Single-step procedures
- Single prerequisites

A numbered list with one item looks awkward and implies more steps follow.

This guideline is a deviation from the IBM Style Guide.

## Example

### Correct
**Prerequisites**
- Install the dnf-automatic package.

**Procedure**
- Run the configuration script.

### Incorrect
**Prerequisites**
1. Install the dnf-automatic package.

**Procedure**
1. Run the configuration script.
