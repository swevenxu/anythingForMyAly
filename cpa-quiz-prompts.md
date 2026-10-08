# AI Prompts for Generating CPA Board Exam Quizzes (Multiple Choice Only)

Subjects covered: **FAR, AFAR, MAS (Management Services), Auditing Theory, Taxation, RFBT**

How to use: paste Prompt #1 first, then use the subject prompt you need. Replace everything in `[brackets]` before pasting. Every prompt below is locked to **multiple-choice questions only** (4 options, A-D, one correct answer).

---

## 1. Setup prompt (paste first)

```
You are an experienced Philippine CPA board exam reviewer and item writer. I'm preparing for the Philippine CPA Licensure Examination, covering: FAR, AFAR, Management Advisory Services (MAS), Auditing Theory, Taxation, and RFBT.

Rules for everything you write:
- MULTIPLE CHOICE ONLY: every question must have exactly 4 options (A-D) with one correct answer. Never produce true/false, essay, fill-in-the-blank, matching, short-answer, or open-ended items. Computational problems must also be multiple choice, with the computed amounts as the options.
- Match the board exam style: situational, with realistic peso amounts for computations.
- Base answers on the rules in effect as of [year/exam date]: PFRS/PAS, PSAs, NIRC as amended (TRAIN, CREATE, EOPT), Civil Code, Revised Corporation Code, etc. If a rule changed recently, say so.
- Every wrong option must be a plausible distractor based on a common mistake.
- Explain why the right answer is right and why each wrong option is wrong.
- Cite a standard, law, or article only if you are confident it is correct. Never invent citations. If unsure, say so.

Confirm, then wait for my next instruction.
```

---

## 2. FAR (Financial Accounting and Reporting)

```
Create [10] FAR board-style multiple-choice questions only (4 options, A-D, one correct answer). Mix: [60]% computational, [40]% theory. Difficulty: [easy / medium / hard / mixed].

Topic: [pick one: Conceptual Framework / PAS 1 & financial statement presentation / cash & receivables / inventories (PAS 2) / PPE (PAS 16) / intangibles (PAS 38) / impairment (PAS 36) / PFRS 15 revenue / PFRS 16 leases / PFRS 9 financial instruments / bonds & notes payable / income taxes (PAS 12) / employee benefits (PAS 19) / share capital & retained earnings / EPS (PAS 33) / cash flows (PAS 7) / accounting changes (PAS 8)]

Show questions and options only. After I submit my answers, grade them, show the full solution for each computation, and name the common trap for each wrong option.
```

---

## 3. AFAR (Advanced Financial Accounting and Reporting)

```
Create [8] AFAR board-style multiple-choice questions only (4 options, A-D, one correct answer) on [pick one: partnership formation/operation/dissolution/liquidation / corporate liquidation / business combination (PFRS 3) / consolidated financial statements (PFRS 10) / non-controlling interest and goodwill / joint arrangements (PFRS 11) / investment in associates (PAS 28) / foreign currency transactions and translation (PAS 21) / derivatives and hedge accounting / home office and branch / interim reporting (PAS 34) / segment reporting (PFRS 8) / construction contracts and service concession / government and NGO accounting].

Each question should be a problem that needs 4+ steps to solve, with the computed amounts as the answer choices. Include at least one trap per question (e.g., unrealized intercompany profit, wrong ownership percentage, fair value adjustment). Do not ask for worksheets or journal entries as answers. Show questions and options only. After I answer, give step-by-step solutions and tell me where candidates usually lose points.
```

---

## 4. MAS (Management Advisory Services)

```
Create [10] MAS board-style multiple-choice questions only (4 options, A-D, one correct answer) on [pick one: cost-volume-profit analysis / absorption vs variable costing / job order and process costing / standard costing and variances / budgeting / relevant costing and make-or-buy / capital budgeting (NPV, IRR, payback, ARR) / cost of capital / working capital management / financial ratio analysis / transfer pricing / activity-based costing / balanced scorecard and performance measures / inventory models (EOQ)].

Mix computational and conceptual questions, all in multiple-choice format. Include at least [3] questions with distractor data (irrelevant numbers). Show questions and options only, then give formulas, solutions, and the trap behind each wrong option after I answer.
```

---

## 5. Auditing Theory

```
Create [15] Auditing Theory board-style multiple-choice questions only (4 options, A-D, one correct answer) on [pick one: PSA 200 objectives and overall principles / engagement acceptance and terms (PSA 210) / quality management / planning and materiality (PSA 300, 320) / risk assessment (PSA 315) / audit responses to assessed risks (PSA 330) / audit evidence and sampling (PSA 500, 530) / internal control / fraud (PSA 240) / going concern (PSA 570) / using the work of experts and internal auditors / audit reports and modified opinions (PSA 700, 705, 706) / Code of Ethics for professional accountants / audit of specific accounts / IT and auditing / other assurance engagements].

Make most questions situational ("What should the auditor do?" or "Which opinion is appropriate?"). Options should be close in wording, like the real exam. Show questions and options only, then explain the reasoning for each option after I answer.
```

---

## 6. Taxation

```
Create [10] Taxation board-style multiple-choice questions only (4 options, A-D, one correct answer) on [pick one: individual income tax (compensation, business, mixed income earners) / corporate income tax (RCIT, MCIT, special rates) / passive income and final taxes / deductions and NOLCO / fringe benefits tax / withholding taxes / VAT / percentage tax / estate tax / donor's tax / excise tax / documentary stamp tax / tax remedies and procedures (assessments, refunds, appeals) / local government taxation / tax incentives].

Mix: [60]% computation, [40]% theory, all in multiple-choice format (computed amounts as the options). Use the rates and rules in effect as of [year] and state clearly which law or revenue regulation changed anything recent (TRAIN, CREATE, EOPT). Show questions and options only. After I answer, give full computations and flag any tax rate or threshold I might be confusing.
```

---

## 7. RFBT (Regulatory Framework for Business Transactions)

```
Create [15] RFBT board-style situational multiple-choice questions only (4 options, A-D, one correct answer) on [pick one: obligations and contracts / sales and lease / agency / partnership / credit transactions (loans, pledge, mortgage, suretyship) / trusts / negotiable instruments / insurance / corporation law (Revised Corporation Code) / securities regulation / insolvency and rehabilitation (FRIA) / intellectual property / data privacy / anti-money laundering / competition and consumer laws].

Use short fact patterns with named parties (A sold to B, etc.) and ask for the legal outcome, with the possible outcomes as the options. After I answer, explain the rule, the legal basis, and why each wrong option fails. Cite article or section numbers only if you are sure they are correct.
```

---

## 8. Weak-area drill (works for any subject)

```
Subject: [FAR / AFAR / MAS / Auditing Theory / Taxation / RFBT]. I keep missing questions on [topic and what confuses you].

1. Explain the concept in under 5 minutes with one simple example.
2. Quiz me one multiple-choice question at a time (4 options, A-D, one correct answer, no other question formats), starting easy and ramping up.
3. After each answer, say whether I'm right, explain, and adjust the next question.
4. After 10 questions, summarize what I've mastered and what to review.
```

---

## 9. Full mock exam for one subject

```
Build a [50]-item multiple-choice mock exam for [subject] (4 options, A-D, one correct answer per item, no other question formats). Weight the topics according to the current PRC/BOA syllabus for that subject: [paste syllabus percentages, or say "use the current official syllabus"]. Mix difficulty like the real exam.

Don't show answers. When I say "submit," grade it, give my score by topic, estimate whether I'd reach the 75% passing mark, and list my 5 weakest topics.
```

---

## 10. Quiz from my own reviewer or notes

```
Here are my notes or reviewer excerpt for [subject]:

[paste text]

Create [10] board-style multiple-choice questions only (4 options, A-D, one correct answer) based only on this material, with explanations. If anything in my notes looks wrong or outdated, flag it.
```

---

## 11. Accuracy check (run on any AI-generated quiz)

```
Act as a skeptical CPA reviewer. Audit this multiple-choice quiz for errors. For each question, check that the keyed answer is correct under current PFRS/PSAs/Philippine law, that no other option can be defended, and that the explanation is accurate. List every problem and rewrite the faulty questions, keeping them in multiple-choice format (A-D).

[paste quiz]
```

---

## Tips

- AI can be wrong on tax rates, thresholds, and recent amendments. Run Prompt #11 and compare against your review materials or the official issuances.
- For Taxation and RFBT especially, state the date (for example, "as of 2026") so the AI doesn't mix old and new rules.
- Ask for one question at a time when you want exam-style pressure.
- Upload or paste the official syllabus so topic weights are accurate.
- If the AI slips into another format, reply with: "Multiple choice only (A-D). Redo it."
