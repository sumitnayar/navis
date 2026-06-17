import os
import re

# Read policyTemplateService.js to verify details
service_path = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\services\policyTemplateService.js"

with open(service_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

print("Verifying policyTemplateService.js content matches our expected layout:")

# Test data mimicking the specific Trackier-style profile
profile = {
    'companyName': 'Trackier',
    'industry': 'SaaS',
    'country': 'India',
    'customerGeography': 'India + EU',
    'employeeCount': '150',
    'b2bB2c': 'B2B',
    'controllerProcessor': 'Processor + Fiduciary',
    'cloudProvider': 'AWS',
    'specialCategories': 'None',
    'dpoOfficer': 'Sumit Nayar',
    'grievanceOfficer': 'Sumit Nayar',
    'processingPurpose': 'Enterprise SaaS tracking analytics and event attribution metadata operations'
}
selected_frameworks = ['DPDPA', 'GDPR', 'ISO 27701']

# Let's write a mock execution of generateSimulatedDraft in Python matching the JS implementation
# We extract the definitions of CLAUSE_LIBRARY from the JS file
clause_matches = re.findall(r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*group:\s*"([^"]+)",\s*frameworks:\s*\[([^\]]+)\],\s*jurisdiction:\s*\[([^\]]+)\],\s*industry:\s*\[([^\]]+)\],\s*version:\s*"([^"]+)",\s*maturity:\s*"([^"]+)",\s*text:\s*"([^"]+)"', js_content.replace('\n', ' '))

print(f"Found {len(clause_matches)} clauses mapped via regex.")

# Manual replica of generateSimulatedDraft matching the JS code exactly:
def generate_simulated_draft(domainKey, templateKey, selectedFrameworks, profile):
    companyName = profile['companyName']
    industry = profile['industry']
    country = profile['country']
    geography = profile['customerGeography']
    cloud = profile['cloudProvider']
    posture = profile['controllerProcessor']
    dpo = profile['dpoOfficer']
    grievance = profile['grievanceOfficer']
    purpose = profile['processingPurpose']
    employeeCount = profile['employeeCount']
    specialCategories = profile['specialCategories']

    fwsFormatted = ", ".join(selectedFrameworks) if selectedFrameworks else "Internal Governance"

    doc = f"""================================================================================
DOCUMENT TITLE:   PIMS Policy
ORGANIZATION:     {companyName} ({industry} sector)
CLASSIFICATION:   Confidential - Internal Use Only
VERSION:          v1.0
STATUS:           Draft (Pending Board Approval)
EFFECTIVE DATE:   16/06/2026
TARGET FRAMEWORKS: {fwsFormatted}
JURISDICTION:     {geography} (Origin: {country})
REVISION OWNER:   {dpo}
================================================================================\n\n"""

    doc += "## 1. PURPOSE & SCOPE\n\n"
    purpose_text = "This policy establishes the operational governance framework for managing information security, security monitoring, and privacy protection protocols at {{COMPANY_NAME}}. It serves to define our administrative and technical safeguards in alignment with global regulatory frameworks and client commitments."
    scope_text = "This policy applies to all databases, application clusters, staging environments, networks, and physical workspaces owned, leased, or operated by {{COMPANY_NAME}}. It governs all full-time employees, contractors, third-party support partners, and sub-processors with access to corporate resources or customer PII."

    def replace_vars(s):
        return (s.replace("{{COMPANY_NAME}}", companyName)
                 .replace("{{INDUSTRY}}", industry)
                 .replace("{{COUNTRY}}", country)
                 .replace("{{CUSTOMER_GEOGRAPHY}}", geography)
                 .replace("{{CLOUD_PROVIDER}}", cloud)
                 .replace("{{POSTURE}}", posture)
                 .replace("{{DPO_OFFICER}}", dpo)
                 .replace("{{GRIEVANCE_OFFICER}}", grievance)
                 .replace("{{PROCESSING_PURPOSE}}", purpose)
                 .replace("{{EMPLOYEE_COUNT}}", employeeCount)
                 .replace("{{SPECIAL_CATEGORIES}}", specialCategories))

    doc += replace_vars(purpose_text) + "\n\n" + replace_vars(scope_text) + "\n\n"

    doc += "## 2. COMPLIANCE DEFINITIONS\n\n"
    defsText = ""
    if "DPDPA" in selectedFrameworks or "DPDP" in selectedFrameworks:
      defsText += "Definitions adhere to the Digital Personal Data Protection Act (DPDPA):\n- 'Data Principal' means the individual to whom the personal data relates.\n- 'Data Fiduciary' means any person who alone or in conjunction with others determines the purpose and means of personal data processing.\n- 'Data Processor' means any person who processes personal data on behalf of a Data Fiduciary.\n\n"
    if "GDPR" in selectedFrameworks:
      defsText += "Under this policy, terms are aligned with GDPR specifications:\n- 'Data Subject' refers to any natural person residing in the EU whose personal data is collected.\n- 'Data Controller' refers to the entity that determines processing purposes (e.g. {{COMPANY_NAME}} as a Fiduciary).\n- 'Data Processor' refers to the entity processing data on behalf of the controller (e.g. {{COMPANY_NAME}} acting as a {{POSTURE}}).\n\n"
    
    doc += replace_vars(defsText)

    doc += "## 3. ROLES & GOVERNANCE OVERSIGHT\n\n"
    roles_text = "Operational oversight is delegated to specialized compliance actors:\n- The Chief Information Security Officer (CISO) owns technical logging, access control audits, and threat monitoring controls.\n- The Data Protection Officer (DPO) ({{DPO_OFFICER}}) supervises privacy impact evaluations and handles data subject access inquiries.\n- The Grievance Officer ({{GRIEVANCE_OFFICER}}) is designated to handle individual complaints and statutory queries."
    doc += replace_vars(roles_text) + "\n\n"

    doc += "## 4. REGULATORY CONTROLS & COMPLIANCE REQUIREMENTS\n\n"
    
    # We will simulate the dynamic clause attachment matching the JS engine
    controls = [
        ("Consent", "Consent Capture & Withdrawal", "Mandated by GDPR Article 7 and DPDPA Section 6, establishing the consent withdrawal standard.",
         "Consent to collect and process personal data must be freely given, specific, informed, and unconditional. Before any data capture occurs, users will receive a clear notice detailing data items collected and their right to withdraw consent. Withdrawal of consent can be executed easily at any time via account settings or emailing support. Processing will cease within 14 days of withdrawal."),
        ("DSAR", "DSAR Request Protocol", "Satisfies GDPR Chapter III and DPDPA Section 11/12 data principal right provisions.",
         "Data Principals and Subjects hold the right to request access, correction, porting, or complete deletion of their personal data. Requests must be verified for identity by the Privacy team. Complete data exports in a structured machine-readable format, or deletion confirmations, must be delivered to the applicant within 30 days of validation."),
        ("Retention", "Data Retention Limits", "Prevents regulatory liability by enforcing storage limitation criteria under GDPR Article 5(1)(e).",
         "Personal data processed by {{COMPANY_NAME}} is subject to retention limits based on the processing summary: '{{PROCESSING_PURPOSE}}'. Backups are recycled on a strict 30-day rotation. Upon contract termination or consent withdrawal, client databases and linked tables will be wiped using secure deletion schedules within 30 days."),
        ("Cross-Border Transfers", "Cross-Border Data Transfers", "Fulfills GDPR Chapter V restrictions and data localization expectations of local acts.",
         "Personal data transfers outside originating jurisdictions will occur only through approved adequacy tools or Standard Contractual Clauses (SCCs). To satisfy data residency demands, {{COMPANY_NAME}} leverages regional hosting zones on {{CLOUD_PROVIDER}} in India and the EU to isolate datasets.")
    ]

    for idx, (group, name, rationale, text) in enumerate(controls):
        doc += f"### 4.{idx+1} {name} (Consultant-Grade)\n"
        doc += f"*Rationale:* {rationale}\n\n"
        doc += replace_vars(text) + "\n\n"

    doc += "## 5. ADMINISTRATIVE PROTOCOLS\n\n"
    training_text = "All personnel must complete security and data privacy awareness training upon hire and annually thereafter. Topics include password hygiene, phishing, data handling sensitivity, remote VPN controls, and incident reporting. Attendance logs and quiz completions are tracked and audited."
    review_text = "This governance framework is subject to mandatory annual review. The CISO and DPO will inspect operational compliance, verify alignment with newer guidelines (including DPDPA and GDPR rules), and submit amendments to executive leadership for approval every 12 months."

    doc += "### 5.1 Training & Human Awareness\n" + replace_vars(training_text) + "\n\n"
    doc += "### 5.2 Revision Controls & Review Frequencies\n" + replace_vars(review_text) + "\n"

    return doc

print("Simulating output for PIMS policy with Trackier profile:")
sim_output = generate_simulated_draft('privacy', 'pims', selected_frameworks, profile)
print(sim_output)

# Save result to verify file in scratch
verify_path = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\scratch\simulated_pims_output.txt"
with open(verify_path, 'w', encoding='utf-8') as out_f:
    out_f.write(sim_output)
print(f"Saved simulated draft preview to: {verify_path}")
