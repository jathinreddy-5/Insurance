import React, { useState } from 'react';
import { 
  ExternalLink, 
  Database, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  FileSpreadsheet,
  AlertOctagon,
  Calendar,
  Building2,
  Receipt,
  FileCheck
} from 'lucide-react';

export default function HospitalResearchGuide() {
  const [activeTab, setActiveTab] = useState('india-microdata');

  return (
    <section id="hospital-research" className="section section-fog" style={{ borderTop: '1px solid var(--color-mist)' }}>
      <div className="container">
        {/* Header Block */}
        <div className="section-heading-block">
          <div className="section-eyebrow" style={{ color: 'var(--color-ember)' }}>
            HEALTH INSURANCE IN HOSPITALS | RESEARCH & ML DATA GUIDE
          </div>
          <h2 className="section-title">
            Hospital Claims, Reimbursement & Indian Health Data Architecture
          </h2>
          <p className="section-desc">
            Extending beyond baseline demographic regression to actual inpatient hospital billing, PM-JAY public health financing, NSS 75th Round microdata, and claim adjudication modeling.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px', borderBottom: '1px solid var(--color-mist)', paddingBottom: '16px' }}>
          {[
            { id: 'india-microdata', label: 'India Hospital Microdata (NSS 75th & PM-JAY)' },
            { id: 'prediction-tasks', label: '5 Distinct Prediction Tasks' },
            { id: 'data-schema', label: 'Hospital Claims Schema (16 Fields)' },
            { id: 'global-sources', label: 'Global Datasets (CMS & MIMIC-IV)' },
            { id: 'leakage-risks', label: 'Leakage & Validity Risks' },
            { id: 'phased-plan', label: '6-Phase ML Roadmap' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'btn-outline' : 'btn-ghost'}
              style={{
                borderRadius: 'var(--radius-buttons)',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: activeTab === tab.id ? 'var(--color-paper)' : 'transparent',
                borderColor: activeTab === tab.id ? 'var(--color-ink)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-ink)' : 'var(--color-graphite)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: India Hospital Microdata (NSS 75th & PM-JAY) */}
        {activeTab === 'india-microdata' && (
          <div>
            {/* Primary Source Table Matching User Screenshot */}
            <div className="card-paper" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Source</th>
                    <th style={{ width: '52%' }}>What you can obtain</th>
                    <th style={{ width: '20%' }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      NSS 75th Health Survey
                    </td>
                    <td>Hospital expenses, reimbursements, patient and household information across 113,823 households.</td>
                    <td>
                      <a 
                        href="https://microdata.gov.in/NADA/index.php/catalog/152" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'var(--color-ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        Get microdata <ArrowUpRight size={14} color="var(--color-ember)" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      NSS hospitalization expenditure dictionary
                    </td>
                    <td>Expenditure and reimbursement field definitions (doctor fees, medicines, diagnostics, bed charges).</td>
                    <td>
                      <a 
                        href="https://microdata.gov.in/NADA/index.php/catalog/152/data-dictionary/F24" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'var(--color-ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        View columns <ArrowUpRight size={14} color="var(--color-ember)" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      MoSPI Health Tables
                    </td>
                    <td>Government statistics by state, ailment category, healthcare sector (public vs private).</td>
                    <td>
                      <a 
                        href="https://esankhyiki.mospi.gov.in/catalogue-main/catalogue?page=0&product=Social+Consumption-Health+%28NSS+75th+Round%29&search=" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'var(--color-ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        View data tables <ArrowUpRight size={14} color="var(--color-ember)" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      PM-JAY research
                    </td>
                    <td>Hospital claims, reimbursement and treatment-package research under Ayushman Bharat.</td>
                    <td>
                      <a 
                        href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10305929/" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'var(--color-ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        Read paper <ArrowUpRight size={14} color="var(--color-ember)" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--color-graphite)', lineHeight: 1.6 }}>
              The NSS survey is the best starting point for your training dataset because it has actual Indian hospital bills and reimbursements in Indian Rupee (₹ INR). Survey period: July 2017 – June 2018 covering 113,823 households across all Indian states and Union Territories.
            </div>

            {/* Official Microdata Blocks Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="card-paper" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '12px' }}>
                  Official NSS 75th Microdata Tables to Prioritize
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ borderBottom: '1px solid var(--color-fog)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>R75250L01 (Blocks 0-1)</div>
                    <div style={{ color: 'var(--color-graphite)' }}>Household identifiers, state codes, and survey sampling weights.</div>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--color-fog)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>R75250L02 (Block 3) & R75250L03 (Block 4)</div>
                    <div style={{ color: 'var(--color-graphite)' }}>Household socioeconomic characteristics, demographic predictors, age, and gender.</div>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--color-fog)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>R75250L05 (Block 6)</div>
                    <div style={{ color: 'var(--color-graphite)' }}>Inpatient hospitalization details during the prior 365 days, nature of ailment, hospital type (public/private).</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>R75250L06 (Block 7)</div>
                    <div style={{ color: 'var(--color-graphite)' }}>Inpatient expenditure items 1-14 (doctor fees, medicines, diagnostic tests, bed charges) and insurance reimbursement amounts.</div>
                  </div>
                </div>
              </div>

              <div className="card-paper" style={{ padding: '24px', borderLeft: '3px solid var(--color-ember)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '12px' }}>
                  Ayushman Bharat PM-JAY Program Architecture
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-graphite)', lineHeight: 1.5, marginBottom: '12px' }}>
                  Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) provides health coverage up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization across India.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="tag-badge">Official Portal</span>
                    <a href="https://pmjay.gov.in/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ink)', fontWeight: 600, textDecoration: 'none' }}>
                      pmjay.gov.in &rarr;
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="tag-badge">Insights Dashboard</span>
                    <a href="https://insights.pmjay.gov.in/Insights%20Dashboard%20Training%20Module.pdf" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ink)', fontWeight: 600, textDecoration: 'none' }}>
                      PM-JAY Insights Module (PDF) &rarr;
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="tag-badge">MoSPI Key Indicators</span>
                    <a href="https://mospi.gov.in/sites/default/files/NSS75250H/KI_Health_75th_Final.pdf" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ink)', fontWeight: 600, textDecoration: 'none' }}>
                      NSS 75th Health Report (PDF) &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* India Published Papers Matrix */}
            <div className="card-paper" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '12px' }}>
                India-Specific Published Research with Data Provenance
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                <div style={{ border: '1px solid var(--color-fog)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>1. District Hospital Financing (PM-JAY)</div>
                  <div style={{ color: 'var(--color-graphite)', margin: '4px 0' }}>Impact of PM-JAY on public sector district hospital financing and reimbursement mechanisms.</div>
                  <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10305929/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ember)', fontWeight: 500, textDecoration: 'none' }}>
                    PMC10305929 &rarr;
                  </a>
                </div>

                <div style={{ border: '1px solid var(--color-fog)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>2. Benefit Package Interventions (Punjab)</div>
                  <div style={{ color: 'var(--color-graphite)', margin: '4px 0' }}>Hospitalization claims and benefit-package restructuring in an Indian state context.</div>
                  <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11381884/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ember)', fontWeight: 500, textDecoration: 'none' }}>
                    PMC11381884 &rarr;
                  </a>
                </div>

                <div style={{ border: '1px solid var(--color-fog)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>3. Curative Healthcare Inequities (NSS)</div>
                  <div style={{ color: 'var(--color-graphite)', margin: '4px 0' }}>Analysis across adult populations utilizing official NSS 71st and 75th round microdata.</div>
                  <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7688179/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ember)', fontWeight: 500, textDecoration: 'none' }}>
                    PMC7688179 &rarr;
                  </a>
                </div>

                <div style={{ border: '1px solid var(--color-fog)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>4. Out-of-Pocket Inpatient Burden</div>
                  <div style={{ color: 'var(--color-graphite)', margin: '4px 0' }}>Financial burden and out-of-pocket spending on Indian households using NSS 75th Health.</div>
                  <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9794050/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ember)', fontWeight: 500, textDecoration: 'none' }}>
                    PMC9794050 &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 5 Distinct Prediction Tasks */}
        {activeTab === 'prediction-tasks' && (
          <div>
            <div className="card-paper" style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#fff9f6', borderLeft: '3px solid var(--color-ember)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                Critical Methodological Principle: Define the Prediction Task First
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-graphite)', lineHeight: 1.5 }}>
                Predicting a patient's medical charges is not the same as predicting the amount an insurer will pay. A model must have a clearly defined target and a dataset that contains the target label. A dataset of general medical charges cannot, by itself, train a reliable claim-approval or reimbursement model.
              </p>
            </div>

            <div className="card-paper" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Prediction Task</th>
                    <th>Target Variable</th>
                    <th>Problem Type</th>
                    <th>Required Data Elements</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      1. Estimate Total Hospital Bill
                    </td>
                    <td><code>total_bill</code> / allowed cost (₹ INR)</td>
                    <td><span className="tag-badge">Regression</span></td>
                    <td>Hospital itemized bills, diagnosis (ICD), procedure code, length of stay, clinical services.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      2. Estimate Insurer Payment
                    </td>
                    <td><code>paid_amount</code> / <code>approved_amount</code> (₹ INR)</td>
                    <td><span className="tag-badge">Regression</span></td>
                    <td>Adjudicated claim lines, policy coverage limits, allowed amounts, payment records.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      3. Predict Claim Approval / Rejection
                    </td>
                    <td><code>claim_status</code> (Approved / Rejected)</td>
                    <td><span className="tag-badge" style={{ background: '#e0e7ff', color: 'var(--color-primary)' }}>Classification</span></td>
                    <td>Historical adjudicated claims with confirmed decision labels and denial codes.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      4. Estimate Patient Out-of-Pocket
                    </td>
                    <td><code>patient_out_of_pocket</code> (₹ INR)</td>
                    <td><span className="tag-badge">Regression</span></td>
                    <td>Total bill, policy coverage, deductibles, co-pay terms, exclusions, insurer settlement.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                      5. Analyze Hospital Reimbursement
                    </td>
                    <td><code>reimbursement_rate</code> / ratio</td>
                    <td><span className="tag-badge">Regression / Descriptive</span></td>
                    <td>Hospital provider identifier, treatment package, submitted amount vs approved amount.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Proposed Hospital Claims Schema (16 Fields) */}
        {activeTab === 'data-schema' && (
          <div>
            <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--color-graphite)' }}>
              Proposed clinical and claims schema for production hospital health insurance research. Designed to cleanly separate clinical predictors from post-adjudication financial targets.
            </div>

            <div className="card-paper" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Example Format</th>
                    <th>Role in Model</th>
                    <th>Clinical & Actuarial Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'patient_age', ex: '45', role: 'Feature', desc: 'Demographic risk factor; use where permitted and justified.' },
                    { name: 'diagnosis_code', ex: 'ICD-10 (e.g. I10, E11)', role: 'Feature', desc: 'Captures primary medical condition; code system must be documented.' },
                    { name: 'procedure_code', ex: 'CPT / PM-JAY Package', role: 'Feature', desc: 'Represents specific clinical treatment or surgical procedure provided.' },
                    { name: 'hospital_type', ex: 'Public / Private', role: 'Feature', desc: 'Explains significant variances in tariff schedule and reimbursement rates.' },
                    { name: 'room_category', ex: 'General / Private / ICU', role: 'Feature', desc: 'Primary driver of room and nursing charges during inpatient stay.' },
                    { name: 'length_of_stay', ex: '4 days', role: 'Feature', desc: 'Inpatient duration feature representing utilization intensity.' },
                    { name: 'total_bill', ex: '₹85,000 INR', role: 'Target (Reg)', desc: 'Total gross hospital expenditure; define whether billed or audited cost.' },
                    { name: 'coverage_limit', ex: '₹5,00,000 INR', role: 'Policy Term', desc: 'Annual sum insured under commercial policy or PM-JAY package ceiling.' },
                    { name: 'deductible', ex: '₹5,000 INR', role: 'Policy Term', desc: 'Patient responsibility threshold prior to insurer claim liability.' },
                    { name: 'copay_amount', ex: '₹5,000 INR', role: 'Policy Term', desc: 'Fixed proportion or co-payment percentage borne by the patient.' },
                    { name: 'approved_amount', ex: '₹70,000 INR', role: 'Target (Reg)', desc: 'Adjudicated amount sanctioned by insurer third-party administrator (TPA).' },
                    { name: 'paid_amount', ex: '₹65,000 INR', role: 'Target (Reg)', desc: 'Actual electronic disbursement transferred to hospital; distinguishes from approved.' },
                    { name: 'claim_status', ex: 'Approved / Rejected', role: 'Target (Class)', desc: 'Binary or multi-class adjudication outcome label.' },
                    { name: 'patient_out_of_pocket', ex: '₹20,000 INR', role: 'Derived Target', desc: 'Net cost borne by patient after insurer settlement and non-medical deductions.' },
                    { name: 'claim_date', ex: '2026-03-15', role: 'Evaluation', desc: 'Enables chronological train-test holdouts to prevent future data leakage.' },
                    { name: 'claim_id', ex: 'CLM-98214', role: 'Identifier', desc: 'Unique record key; supports claim-line grouping; NEVER used as a feature.' },
                  ].map((field) => (
                    <tr key={field.name}>
                      <td style={{ fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
                        {field.name}
                      </td>
                      <td style={{ color: 'var(--color-graphite)', fontSize: '13px' }}>
                        {field.ex}
                      </td>
                      <td>
                        <span className="tag-badge" style={{ 
                          backgroundColor: field.role.includes('Target') ? '#fff1eb' : 'var(--color-fog)',
                          color: field.role.includes('Target') ? 'var(--color-ember)' : 'var(--color-graphite)',
                          borderColor: field.role.includes('Target') ? '#ffd8c7' : 'var(--color-mist)'
                        }}>
                          {field.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--color-graphite)' }}>
                        {field.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Global Datasets (CMS & MIMIC-IV) */}
        {activeTab === 'global-sources' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card-paper" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  CMS Medicare Claims Public Use Files
                </h3>
                <span className="tag-badge">US Centers for Medicare</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-graphite)', lineHeight: 1.5, marginBottom: '12px' }}>
                Public-use claims files published by the US Centers for Medicare & Medicaid Services. Contains billed charges, allowed amounts, and net payments across inpatient, outpatient, and carrier claims.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div><strong>Use for:</strong> Actual reimbursement analysis and Medicare cost prediction.</div>
                <div><strong>Limitation:</strong> US Medicare billing regulations differ fundamentally from Indian PM-JAY and private cash-less networks.</div>
                <a href="https://www.cms.gov/data-research/statistics-trends-and-reports/basic-stand-alone-medicare-claims-public-use-files" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ember)', fontWeight: 500, textDecoration: 'none', marginTop: '6px' }}>
                  Access CMS Claims Data &rarr;
                </a>
              </div>
            </div>

            <div className="card-paper" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  MIMIC-IV Hospital Electronic Health Records
                </h3>
                <span className="tag-badge">PhysioNet / MIT</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-graphite)', lineHeight: 1.5, marginBottom: '12px' }}>
                De-identified hospital and intensive care unit clinical database. Contains itemized diagnoses, procedure codes, lab tests, and medications.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div><strong>Use for:</strong> Length-of-stay and clinical complexity features correlated with hospital costs.</div>
                <div><strong>Access:</strong> Requires CITI Human Subjects Training credentialing and PhysioNet Data Use Agreement.</div>
                <a href="https://physionet.org/content/mimiciv/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-ember)', fontWeight: 500, textDecoration: 'none', marginTop: '6px' }}>
                  Access PhysioNet MIMIC-IV &rarr;
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Leakage & Academic Safeguards */}
        {activeTab === 'leakage-risks' && (
          <div className="card-paper" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '16px' }}>
              Academic Integrity, Target Leakage & Presentation Defenses
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px' }}>
              <div style={{ borderLeft: '3px solid #dc2626', paddingLeft: '14px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Target Leakage Prohibition
                </div>
                <div style={{ color: 'var(--color-graphite)', lineHeight: 1.4 }}>
                  Never use <code>approved_amount</code>, <code>paid_amount</code>, or <code>denial_reason</code> as input features when evaluating a model designed to predict claim approval before TPA adjudication.
                </div>
              </div>

              <div style={{ borderLeft: '3px solid #dc2626', paddingLeft: '14px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Household / Patient Clustered Splitting
                </div>
                <div style={{ color: 'var(--color-graphite)', lineHeight: 1.4 }}>
                  Avoid random row splits when multiple claim lines originate from the same patient or hospital admission. Use a clustered patient-level or chronological train-test split.
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--color-ember)', paddingLeft: '14px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  R² Accuracy Clarification for Panel
                </div>
                <div style={{ color: 'var(--color-graphite)', lineHeight: 1.4 }}>
                  R² is the coefficient of determination (variance explained) in regression, not classification percentage accuracy. Always report MAE and RMSE in Indian Rupee (₹ INR).
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--color-ember)', paddingLeft: '14px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Currency Non-Equivalence
                </div>
                <div style={{ color: 'var(--color-graphite)', lineHeight: 1.4 }}>
                  Never merge international dollar amounts with Indian rupee figures without explicit currency conversion and purchasing power parity (PPP) documentation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Phased Implementation Roadmap */}
        {activeTab === 'phased-plan' && (
          <div className="card-paper" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Core Milestone Deliverable</th>
                  <th>Current Project Status</th>
                  <th>Target Artifact & Output</th>
                </tr>
              </thead>
              <tbody>
                <tr className="highlight-row">
                  <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Phase 1</td>
                  <td>Baseline Demographic Medical Cost Prediction</td>
                  <td><span className="tag-badge active">Completed (R² = 0.8710)</span></td>
                  <td>Tuned Random Forest on 1,338 records, serialized as <code>rf_tuned.pkl</code>.</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Phase 2</td>
                  <td>Hospital & Claims Dataset Feasibility Review</td>
                  <td><span className="tag-badge">Documented</span></td>
                  <td>NSS 75th microdata catalog and PM-JAY hospital package review.</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Phase 3</td>
                  <td>Inpatient Hospital Cost & Reimbursement Model</td>
                  <td><span className="tag-badge">Planned</span></td>
                  <td>Unit-level regression on NSS Block 7 inpatient expenditure files.</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Phase 4</td>
                  <td>Model Explainability & SHAP Decomposition</td>
                  <td><span className="tag-badge">Planned</span></td>
                  <td>Feature importance, SHAP values, and error distribution across cost tiers.</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Phase 5</td>
                  <td>Interactive Clinical Workbench Interface</td>
                  <td><span className="tag-badge active">Deployed Live</span></td>
                  <td>Brex-style React web application running real-time 100-tree inference.</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Phase 6</td>
                  <td>Academic Project Report & Defense Dossier</td>
                  <td><span className="tag-badge active">Integrated</span></td>
                  <td>Complete literature review, dataset provenance, and review panel defenses.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
