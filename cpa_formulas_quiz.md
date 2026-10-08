# CPA Formula Bank for Formula-Identification Quizzes

116 formulas across FAR, AFAR, MS, AT, TAX and RFBT.

## Entry format

Every formula is one `###` block with the same fields, so it can be parsed with a simple script.

- `###` heading: `slug — name`. The slug is a unique id.
- `subject`, `topic`: for filtering quizzes by subject or topic.
- `formula`: plain text. A fraction is written `(top) ÷ (bottom)`, and several formulas in one entry are separated by `;`.
- `latex`: the same formula for rendering with KaTeX or MathJax.
- `use when`: the kind of problem that calls for this formula. Use it to write the question scenario.
- `confused with`: slugs of look-alike formulas. Use them as wrong answer choices.
- `note`: optional. A caveat about when the formula applies.

## How to use it in the quiz maker

1. Pick an entry, or several for a mixed set.
2. Ask the AI for a short scenario that needs that formula, without naming the formula.
3. Build four answer choices: the correct formula plus three formulas from its `confused with` list. If it has fewer than three, add formulas from the same topic.
4. Render choices with the `latex` field.
5. After the answer, show the formula name and why the other choices do not fit.

## Prompt for the AI

```
You write multiple-choice questions that train CPA candidates to pick the right formula.
Input: one formula entry (name, formula, use when, confused with) and 3 distractor entries.
Write a 2-3 sentence scenario with realistic peso amounts that requires the input formula.
Do not name the formula or give away its terms. Do not ask the student to compute the answer.
The question is: "Which formula should be used?"
The correct answer is the input formula. The distractors are the 3 distractor formulas.
Return JSON only:
{"scenario": "...", "choices": [{"id": "A", "slug": "..."}, ...], "answer": "B",
 "why_correct": "one sentence tying the scenario to the formula",
 "why_not": {"slug": "one sentence each for the wrong choices"}}
Use only the formulas provided. Shuffle the choice order.
```

Keep the answer's `slug` in the JSON and look up the `formula` and `latex` fields in your own code. Then the AI never has to retype a formula, so it cannot garble one.

## Question variants

- Scenario to formula: the default above.
- Formula to scenario: show the formula and ask which situation it applies to.
- Missing term: show the formula with one term blanked out and ask what goes in the blank.
- Same-name trap: pair formulas from one `confused with` group, such as the labor rate and efficiency variances, so the student learns the differences.

## Before you publish

- The multi-line entries (variances, bank loan costs, pricing) hold more than one formula. Split them into separate entries if you want one formula per question.
- Check the formulas against your own references. A wrong choice in a formula quiz teaches the wrong thing.


## FAR — Financial Accounting and Reporting

### cost-ratio — Cost ratio (retail method)
- subject: FAR
- topic: Inventory (PAS 2)
- formula: Cost ratio = Goods available for sale at cost ÷ Goods available for sale at selling price
- latex: `\text{Cost ratio}=\dfrac{\text{Goods available for sale at cost}}{\text{Goods available for sale at selling price}}`
- use when: Converting retail-price inventory to cost; given cost and retail of goods available
- confused with: ending-inv-retail, gp-cogs

### ending-inv-retail — Ending inventory at cost (retail method)
- subject: FAR
- topic: Inventory (PAS 2)
- formula: Ending inventory at cost = (Goods available at retail − Net sales) × Cost ratio
- latex: `\text{Ending inventory at cost}=(\text{Goods available at retail}-\text{Net sales})\times \text{Cost ratio}`
- use when: Ending inventory is known at selling price and must be stated at cost
- confused with: cost-ratio, gp-cogs

### gp-cogs — Cost of goods sold (gross profit method)
- subject: FAR
- topic: Inventory (PAS 2)
- formula: COGS = Net sales × Cost ratio  (GP rate based on sales); COGS = Net sales ÷ Sales ratio  (GP rate based on cost)
- latex: `\begin{aligned} \text{COGS}=\text{Net sales}\times \text{Cost ratio}(\text{GP rate based on sales}) \\ \text{COGS}=\dfrac{\text{Net sales}}{\text{Sales ratio}}(\text{GP rate based on cost}) \end{aligned}`
- use when: Estimating COGS or lost inventory from a gross profit rate, no physical count
- confused with: cost-ratio, ending-inv-retail

### avg-unit-cost — Weighted average unit cost (periodic)
- subject: FAR
- topic: Inventory (PAS 2)
- formula: Average unit cost = Cost of goods available for sale ÷ Units available for sale
- latex: `\text{Average unit cost}=\dfrac{\text{Cost of goods available for sale}}{\text{Units available for sale}}`
- use when: Periodic system, no FIFO or LIFO layers; price units on hand
- confused with: cost-ratio

### depletion-uop — Depletion, units of output
- subject: FAR
- topic: Wasting assets and depreciation (PFRS 6)
- formula: Depletion = (Total cost − Residual value) ÷ Units estimated to be extracted × Units extracted
- latex: `\text{Depletion}=\dfrac{\text{Total cost}-\text{Residual value}}{\text{Units estimated to be extracted}}\times \text{Units extracted}`
- use when: Natural resource: mine, timber or oil, with units extracted this year
- confused with: depletion-rate-revised, sl-depreciation

### depletion-rate-revised — Revised depletion rate per unit
- subject: FAR
- topic: Wasting assets and depreciation (PFRS 6)
- formula: New rate per unit = Remaining depletion cost ÷ Remaining revised estimate of output
- latex: `\text{New rate per unit}=\dfrac{\text{Remaining depletion cost}}{\text{Remaining revised estimate of output}}`
- use when: Estimate of recoverable units changed or extra development cost was incurred
- confused with: depletion-uop

### sl-depreciation — Straight-line depreciation (mining equipment)
- subject: FAR
- topic: Wasting assets and depreciation (PFRS 6)
- formula: Depreciation = Depreciable cost ÷ Useful life
- latex: `\text{Depreciation}=\dfrac{\text{Depreciable cost}}{\text{Useful life}}`
- use when: Equipment whose life is shorter than the wasting asset's, or movable equipment
- confused with: depletion-uop

### max-liq-dividend — Maximum dividend, wasting asset corporation
- subject: FAR
- topic: Wasting assets and depreciation (PFRS 6)
- formula: Maximum dividend = Accumulated profits − Capital liquidated in prior years + Accumulated depletion − Depletion in ending inventory
- latex: `\text{Maximum dividend}=\text{Accumulated profits}-\text{Capital liquidated in prior years}+\text{Accumulated depletion}-\text{Depletion in ending inventory}`
- use when: Corporation may return capital via dividend because it is a wasting asset company

### cap-rate — Capitalization rate
- subject: FAR
- topic: Borrowing costs (PAS 23) and leases
- formula: Capitalization rate = Total annual borrowing cost ÷ Total general borrowings outstanding
- latex: `\text{Capitalization rate}=\dfrac{\text{Total annual borrowing cost}}{\text{Total general borrowings outstanding}}`
- use when: Several general borrowings fund a qualifying asset
- confused with: cap-cost

### cap-cost — Capitalizable borrowing cost
- subject: FAR
- topic: Borrowing costs (PAS 23) and leases
- formula: Specific borrowing: Actual borrowing cost − Investment income on temporary investment; General borrowing: Average carrying amount × Capitalization rate
- latex: `\begin{aligned} \text{Specific borrowing: Actual borrowing cost}-\text{Investment income on temporary investment} \\ \text{General borrowing: Average carrying amount}\times \text{Capitalization rate} \end{aligned}`
- use when: Interest on a loan used to build a qualifying asset
- confused with: cap-rate
- note: General-borrowing amount cannot exceed actual interest incurred

### gross-inv — Gross investment (lessor)
- subject: FAR
- topic: Borrowing costs (PAS 23) and leases
- formula: Gross investment = Gross rentals + Residual value (guaranteed or unguaranteed)
- latex: `\text{Gross investment}=\text{Gross rentals}+\text{Residual value}(\text{guaranteed or unguaranteed})`
- use when: Lessor in a finance lease; total undiscounted amounts to be received
- confused with: net-inv, unearned-int

### net-inv — Net investment in the lease
- subject: FAR
- topic: Borrowing costs (PAS 23) and leases
- formula: Net investment = PV of gross rentals + PV of residual value
- latex: `\text{Net investment}=\text{PV of gross rentals}+\text{PV of residual value}`
- use when: Lessor records the lease receivable at present value
- confused with: gross-inv, unearned-int

### unearned-int — Unearned interest income
- subject: FAR
- topic: Borrowing costs (PAS 23) and leases
- formula: Unearned interest income = Gross investment − Net investment
- latex: `\text{Unearned interest income}=\text{Gross investment}-\text{Net investment}`
- use when: Total interest the lessor will earn over the lease term
- confused with: gross-inv, net-inv

### sales-type-sales — Sales, sales-type lease
- subject: FAR
- topic: Borrowing costs (PAS 23) and leases
- formula: Sales = lower of Net investment or Fair value of the asset
- latex: `\text{Sales}=\text{lower of Net investment or Fair value of the asset}`
- use when: Manufacturer or dealer lessor recognizing a sale
- confused with: sales-type-gp

### sales-type-gp — Gross profit, sales-type lease
- subject: FAR
- topic: Borrowing costs (PAS 23) and leases
- formula: Gross profit = Sales − (Cost of asset sold + Initial direct cost)
- latex: `\text{Gross profit}=\text{Sales}-(\text{Cost of asset sold}+\text{Initial direct cost})`
- use when: Manufacturer or dealer lessor computing selling profit
- confused with: sales-type-sales

### right-value — Value of one stock right
- subject: FAR
- topic: Shareholders' equity and EPS
- formula: Right-on: (MV right-on − Subscription price) ÷ (Rights needed per share + 1); Ex-right: (MV ex-right − Subscription price) ÷ Rights needed per share
- latex: `\begin{aligned} \text{Right-on:}\dfrac{\text{MV right-on}-\text{Subscription price}}{\text{Rights needed per share}+1} \\ \text{Ex-right:}\dfrac{\text{MV ex-right}-\text{Subscription price}}{\text{Rights needed per share}} \end{aligned}`
- use when: Rights offering; stock still carries the right (right-on) or has gone ex-right
- confused with: bvps

### bvps — Book value per share (one class)
- subject: FAR
- topic: Shareholders' equity and EPS
- formula: BVPS = Total shareholders' equity ÷ Shares outstanding
- latex: `\text{BVPS}=\dfrac{\text{Total shareholders' equity}}{\text{Shares outstanding}}`
- use when: Only ordinary shares are outstanding
- confused with: basic-eps

### basic-eps — Basic earnings per share
- subject: FAR
- topic: Shareholders' equity and EPS
- formula: Basic EPS = (Net income − Preference dividends) ÷ Weighted average ordinary shares
- latex: `\text{Basic EPS}=\dfrac{\text{Net income}-\text{Preference dividends}}{\text{Weighted average ordinary shares}}`
- use when: Earnings attributable to each ordinary share
- confused with: bvps, incremental-shares, eps-ratio

### incremental-shares — Incremental shares from options (treasury share method)
- subject: FAR
- topic: Shareholders' equity and EPS
- formula: Incremental shares = Option shares − Proceeds ÷ Average market price
- latex: `\text{Incremental shares}=\text{Option shares}-\dfrac{\text{Proceeds}}{\text{Average market price}}`
- use when: Diluted EPS with options or warrants; exercise price below market
- confused with: basic-eps


## AFAR — Advanced Financial Accounting and Reporting

### partner-diff — Capital difference on admission by investment
- subject: AFAR
- topic: Partnership and liquidation
- formula: Difference = Total agreed capital − Total contributed capital
- latex: `\text{Difference}=\text{Total agreed capital}-\text{Total contributed capital}`
- use when: New partner invests; compare agreed vs. contributed capital for bonus or goodwill

### max-loss — Maximum possible loss (installment liquidation)
- subject: AFAR
- topic: Partnership and liquidation
- formula: Maximum possible loss = Unrealized noncash assets + Cash withheld (unpaid and liquidation expenses)
- latex: `\text{Maximum possible loss}=\text{Unrealized noncash assets}+\text{Cash withheld}(\text{unpaid and liquidation expenses})`
- use when: Computing safe payments to partners in an installment liquidation
- confused with: loss-absorption

### loss-absorption — Loss absorption ability
- subject: AFAR
- topic: Partnership and liquidation
- formula: Loss absorption ability = Total interest (capital ± loans) ÷ P&L ratio
- latex: `\text{Loss absorption ability}=\dfrac{\text{Total interest}(\text{capital}\pm \text{loans})}{\text{P\&L ratio}}`
- use when: Ranking which partner is most vulnerable to losses
- confused with: max-loss

### recovery-pct — Estimated recovery % for unsecured creditors
- subject: AFAR
- topic: Partnership and liquidation
- formula: Recovery % = Net free assets ÷ Total unsecured creditors
- latex: `\text{Recovery \%}=\dfrac{\text{Net free assets}}{\text{Total unsecured creditors}}`
- use when: Corporate liquidation; dividend to general unsecured creditors

### branch-cost — Cost from billed price (branch)
- subject: AFAR
- topic: Home office, branch and costing
- formula: Cost = Billed price ÷ (100% + % markup on cost)
- latex: `\text{Cost}=\dfrac{\text{Billed price}}{100\%+\text{\% markup on cost}}`
- use when: Home office bills the branch above cost; find true cost or overvaluation

### units-completed — Completed and transferred-out units
- subject: AFAR
- topic: Home office, branch and costing
- formula: Completed = Beginning units + Started − Ending units − Lost units
- latex: `\text{Completed}=\text{Beginning units}+\text{Started}-\text{Ending units}-\text{Lost units}`
- use when: Process costing; units finished during the period
- confused with: started-completed

### started-completed — Started and completed units
- subject: AFAR
- topic: Home office, branch and costing
- formula: Started & completed = Started − Ending units − Lost units
- latex: `\text{Started \& completed}=\text{Started}-\text{Ending units}-\text{Lost units}`
- use when: Process costing; units begun and finished in the same period
- confused with: units-completed

### eup-wa — Equivalent units, weighted average
- subject: AFAR
- topic: Home office, branch and costing
- formula: EUP = Beginning inventory + Started & completed + Ending inventory × % complete
- latex: `\text{EUP}=\text{Beginning inventory}+\text{Started \& completed}+\text{Ending inventory}\times \text{\% complete}`
- use when: Weighted average method; beginning work counts fully
- confused with: eup-fifo

### eup-fifo — Equivalent units, FIFO
- subject: AFAR
- topic: Home office, branch and costing
- formula: EUP = Beginning × (1 − % complete) + Started & completed + Ending × % complete
- latex: `\text{EUP}=\text{Beginning}\times (1-\text{\% complete})+\text{Started \& completed}+\text{Ending}\times \text{\% complete}`
- use when: FIFO method; only work done this period counts
- confused with: eup-wa

### approx-nrv — Approximated net realizable value
- subject: AFAR
- topic: Home office, branch and costing
- formula: Approximated NRV = Final sales value − Expected separable costs
- latex: `\text{Approximated NRV}=\text{Final sales value}-\text{Expected separable costs}`
- use when: Allocating joint costs when products need further processing

### abc-rate — Activity-based overhead rate
- subject: AFAR
- topic: Home office, branch and costing
- formula: Rate = Estimated overhead per activity ÷ Expected use of cost driver
- latex: `\text{Rate}=\dfrac{\text{Estimated overhead per activity}}{\text{Expected use of cost driver}}`
- use when: Assigning overhead from an activity cost pool to products


## MS — Management Services

### cost-formula — Cost formula
- subject: MS
- topic: Cost behavior
- formula: y = a + bx
- latex: `\text{y}=\text{a}+\text{bx}`
- use when: Mixed cost; a is fixed cost, b is variable cost per unit of activity
- confused with: least-squares

### least-squares — Least squares equations
- subject: MS
- topic: Cost behavior
- formula: ΣY = na + bΣx; Σxy = aΣx + bΣx²
- latex: `\begin{aligned} \sum \text{Y}=\text{na}+\text{b}\sum \text{x} \\ \sum \text{xy}=\text{a}\sum \text{x}+\text{b}\sum \text{x}^2 \end{aligned}`
- use when: Regression method to split fixed and variable cost
- confused with: cost-formula

### cm-unit — Contribution margin per unit
- subject: MS
- topic: Cost-volume-profit
- formula: CM per unit = Selling price − Variable cost per unit
- latex: `\text{CM per unit}=\text{Selling price}-\text{Variable cost per unit}`
- use when: Per-unit amount left to cover fixed costs
- confused with: cm-ratio

### cm-ratio — Contribution margin ratio
- subject: MS
- topic: Cost-volume-profit
- formula: CM ratio = CM per unit ÷ Unit selling price
- latex: `\text{CM ratio}=\dfrac{\text{CM per unit}}{\text{Unit selling price}}`
- use when: Peso-based analysis, multi-product sales mix by peso
- confused with: cm-unit, bep-peso

### bep-units — Break-even point in units
- subject: MS
- topic: Cost-volume-profit
- formula: BEP units = Fixed costs ÷ CM per unit
- latex: `\text{BEP units}=\dfrac{\text{Fixed costs}}{\text{CM per unit}}`
- use when: Units needed for zero profit
- confused with: bep-peso, target-units

### bep-peso — Break-even point in peso
- subject: MS
- topic: Cost-volume-profit
- formula: BEP peso = Fixed costs ÷ CM ratio
- latex: `\text{BEP peso}=\dfrac{\text{Fixed costs}}{\text{CM ratio}}`
- use when: Sales amount needed for zero profit
- confused with: bep-units, target-peso

### target-units — Units for a target profit
- subject: MS
- topic: Cost-volume-profit
- formula: Units = (Fixed costs + Target profit) ÷ CM per unit
- latex: `\text{Units}=\dfrac{\text{Fixed costs}+\text{Target profit}}{\text{CM per unit}}`
- use when: Units needed to earn a desired profit
- confused with: bep-units, target-peso

### target-peso — Peso sales for a target profit
- subject: MS
- topic: Cost-volume-profit
- formula: Peso sales = (Fixed costs + Target profit) ÷ CM ratio
- latex: `\text{Peso sales}=\dfrac{\text{Fixed costs}+\text{Target profit}}{\text{CM ratio}}`
- use when: Sales amount needed to earn a desired profit
- confused with: target-units, target-ros

### target-ros — Peso sales for a target return on sales
- subject: MS
- topic: Cost-volume-profit
- formula: Peso sales = Fixed costs ÷ (CM ratio − Return on sales)
- latex: `\text{Peso sales}=\dfrac{\text{Fixed costs}}{\text{CM ratio}-\text{Return on sales}}`
- use when: Profit target stated as a percentage of sales
- confused with: target-peso

### pretax-profit — Profit before tax from after-tax target
- subject: MS
- topic: Cost-volume-profit
- formula: Profit before tax = Profit after tax ÷ (100% − Tax rate)
- latex: `\text{Profit before tax}=\dfrac{\text{Profit after tax}}{100\%-\text{Tax rate}}`
- use when: Target income given after tax; CVP needs pre-tax profit

### bep-mix-units — Break-even units, sales mix
- subject: MS
- topic: Cost-volume-profit
- formula: BEP units = Fixed costs ÷ Weighted average CM per unit
- latex: `\text{BEP units}=\dfrac{\text{Fixed costs}}{\text{Weighted average CM per unit}}`
- use when: Several products sold in a constant mix; units basis
- confused with: bep-mix-peso, bep-units

### bep-mix-peso — Break-even peso, sales mix
- subject: MS
- topic: Cost-volume-profit
- formula: BEP peso = Fixed costs ÷ Weighted average CM ratio
- latex: `\text{BEP peso}=\dfrac{\text{Fixed costs}}{\text{Weighted average CM ratio}}`
- use when: Several products or divisions in a constant mix; peso basis
- confused with: bep-mix-units, bep-peso

### mos — Margin of safety
- subject: MS
- topic: Cost-volume-profit
- formula: Margin of safety = Sales − Break-even sales
- latex: `\text{Margin of safety}=\text{Sales}-\text{Break-even sales}`
- use when: How far sales can fall before a loss
- confused with: mos-ratio

### mos-ratio — Margin of safety ratio
- subject: MS
- topic: Cost-volume-profit
- formula: MOS ratio = Margin of safety ÷ Sales
- latex: `\text{MOS ratio}=\dfrac{\text{Margin of safety}}{\text{Sales}}`
- use when: Safety cushion as a share of sales
- confused with: mos

### dol — Degree of operating leverage
- subject: MS
- topic: Cost-volume-profit
- formula: DOL = Contribution margin ÷ Profit before tax
- latex: `\text{DOL}=\dfrac{\text{Contribution margin}}{\text{Profit before tax}}`
- use when: Sensitivity of profit to a change in sales
- confused with: dol-change

### dol-change — Profit change from sales change
- subject: MS
- topic: Cost-volume-profit
- formula: % change in profit = % change in sales × DOL
- latex: `\text{\% change in profit}=\text{\% change in sales}\times \text{DOL}`
- use when: Forecasting profit after a given % change in sales
- confused with: dol

### abs-var-diff — Income difference, absorption vs. variable
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: Δ Income = Δ Inventory × Unit fixed factory overhead
- latex: `\Delta \text{Income}=\Delta \text{Inventory}\times \text{Unit fixed factory overhead}`
- use when: Reconciling the two methods when production differs from sales
- confused with: var-income

### var-income — Variable-costing income from absorption income
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: Variable income = Absorption income + FFOH in beginning inventory − FFOH in ending inventory
- latex: `\text{Variable income}=\text{Absorption income}+\text{FFOH in beginning inventory}-\text{FFOH in ending inventory}`
- use when: Converting absorption income to variable costing income
- confused with: abs-var-diff

### mpv — Material price variance
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: MPV = (Actual price − Std price) × Actual quantity purchased
- latex: `\text{MPV}=(\text{Actual price}-\text{Std price})\times \text{Actual quantity purchased}`
- use when: Price paid differs from standard price
- confused with: mqv

### mqv — Material quantity variance
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: MQV = (Actual quantity − Std quantity) × Std price
- latex: `\text{MQV}=(\text{Actual quantity}-\text{Std quantity})\times \text{Std price}`
- use when: Materials used differ from the standard allowed
- confused with: mpv

### lrv — Labor rate variance
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: LRV = (Actual rate − Std rate) × Actual hours
- latex: `\text{LRV}=(\text{Actual rate}-\text{Std rate})\times \text{Actual hours}`
- use when: Wage rate paid differs from standard
- confused with: lev

### lev — Labor efficiency variance
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: LEV = (Actual hours − Std hours) × Std rate
- latex: `\text{LEV}=(\text{Actual hours}-\text{Std hours})\times \text{Std rate}`
- use when: Hours worked differ from standard hours allowed
- confused with: lrv

### foh-2way — Two-way overhead variances
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: Controllable = Actual FOH − Budget at std hours; Volume = Budget at std hours − Applied FOH
- latex: `\begin{aligned} \text{Controllable}=\text{Actual FOH}-\text{Budget at std hours} \\ \text{Volume}=\text{Budget at std hours}-\text{Applied FOH} \end{aligned}`
- use when: Overhead analysis with two variances only
- confused with: foh-3way

### foh-3way — Three-way overhead variances
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: Spending = Actual FOH − Budget at actual hours; Efficiency = Budget at actual hours − Budget at std hours; Volume = Budget at std hours − Applied FOH
- latex: `\begin{aligned} \text{Spending}=\text{Actual FOH}-\text{Budget at actual hours} \\ \text{Efficiency}=\text{Budget at actual hours}-\text{Budget at std hours} \\ \text{Volume}=\text{Budget at std hours}-\text{Applied FOH} \end{aligned}`
- use when: Overhead analysis with spending, efficiency and volume
- confused with: foh-2way

### dm-purchases — Direct materials to purchase
- subject: MS
- topic: Absorption and variable costing, standard costing
- formula: Materials to purchase = Required for production + Desired ending − Beginning
- latex: `\text{Materials to purchase}=\text{Required for production}+\text{Desired ending}-\text{Beginning}`
- use when: Materials purchases budget

### roi — Return on investment
- subject: MS
- topic: Performance evaluation and pricing
- formula: ROI = Operating income ÷ Average operating assets
- latex: `\text{ROI}=\dfrac{\text{Operating income}}{\text{Average operating assets}}`
- use when: Investment center performance
- confused with: roa-ratio, ri

### dupont — DuPont return on assets
- subject: MS
- topic: Performance evaluation and pricing
- formula: ROA = Net income ÷ Sales × Sales ÷ Assets
- latex: `\text{ROA}=\dfrac{\text{Net income}}{\text{Sales}}\times \dfrac{\text{Sales}}{\text{Assets}}`
- use when: Breaking return into margin and turnover
- confused with: roi

### ri — Residual income
- subject: MS
- topic: Performance evaluation and pricing
- formula: RI = Operating income − (Minimum rate of return × Operating assets)
- latex: `\text{RI}=\text{Operating income}-(\text{Minimum rate of return}\times \text{Operating assets})`
- use when: Income above a required return on assets
- confused with: eva, roi

### eva — Economic value added
- subject: MS
- topic: Performance evaluation and pricing
- formula: EVA = EBIT × (1 − Tax rate) − After-tax WACC × (Total assets − Noninterest-bearing current liabilities)
- latex: `\text{EVA}=\text{EBIT}\times (1-\text{Tax rate})-\text{After-tax WACC}\times (\text{Total assets}-\text{Noninterest-bearing current liabilities})`
- use when: Residual income using the weighted average cost of capital
- confused with: ri

### transfer-price — Transfer price limits
- subject: MS
- topic: Performance evaluation and pricing
- formula: Maximum = Cost of buying from outside suppliers; Minimum = Variable cost per unit + Lost CM per unit on outside sales
- latex: `\begin{aligned} \text{Maximum}=\text{Cost of buying from outside suppliers} \\ \text{Minimum}=\text{Variable cost per unit}+\text{Lost CM per unit on outside sales} \end{aligned}`
- use when: Setting the range for internal sales between divisions

### price-abs — Target price, absorption cost approach
- subject: MS
- topic: Performance evaluation and pricing
- formula: Price = Mfg cost per unit × (1 + Markup %); Markup % = (Desired ROI per unit + S&A expenses per unit) ÷ Mfg cost per unit
- latex: `\begin{aligned} \text{Price}=\text{Mfg cost per unit}\times (1+\text{Markup \%}) \\ \text{Markup \%}=\dfrac{\text{Desired ROI per unit}+\text{S\&A expenses per unit}}{\text{Mfg cost per unit}} \end{aligned}`
- use when: Cost-plus pricing on full manufacturing cost
- confused with: price-var

### price-var — Target price, variable cost pricing
- subject: MS
- topic: Performance evaluation and pricing
- formula: Price = Variable cost per unit × (1 + Markup %); Markup % = (Desired ROI per unit + Fixed costs per unit) ÷ Variable cost per unit
- latex: `\begin{aligned} \text{Price}=\text{Variable cost per unit}\times (1+\text{Markup \%}) \\ \text{Markup \%}=\dfrac{\text{Desired ROI per unit}+\text{Fixed costs per unit}}{\text{Variable cost per unit}} \end{aligned}`
- use when: Cost-plus pricing on variable cost, for short-run decisions
- confused with: price-abs

### ncf — Net annual cash flow
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: Net annual cash flow = Net income + Depreciation expense
- latex: `\text{Net annual cash flow}=\text{Net income}+\text{Depreciation expense}`
- use when: Estimating cash flow from accounting income
- confused with: payback

### payback — Payback period
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: Payback = Capital investment ÷ Net annual cash flow
- latex: `\text{Payback}=\dfrac{\text{Capital investment}}{\text{Net annual cash flow}}`
- use when: Years to recover the investment, equal annual cash flows
- confused with: arr, ncf

### arr — Accounting rate of return
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: ARR = Expected annual net income ÷ Average investment
- latex: `\text{ARR}=\dfrac{\text{Expected annual net income}}{\text{Average investment}}`
- use when: Return based on accounting income, not cash flow
- confused with: payback

### pi — Profitability index
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: PI = PV of future cash flows ÷ Initial investment
- latex: `\text{PI}=\dfrac{\text{PV of future cash flows}}{\text{Initial investment}}`
- use when: Ranking projects of different sizes
- confused with: irr-pvf

### irr-pvf — Present value factor for IRR
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: PVF = Net investment ÷ Net cash inflows
- latex: `\text{PVF}=\dfrac{\text{Net investment}}{\text{Net cash inflows}}`
- use when: Finding the IRR with equal annual inflows, then look up in the annuity table
- confused with: payback, pi

### capm — CAPM cost of common equity
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: R = RF + β × (RM − RF)
- latex: `\text{R}=\text{RF}+\beta \times (\text{RM}-\text{RF})`
- use when: Cost of equity from beta, risk-free rate and market return
- confused with: ddm-re

### ddm-re — Dividend growth model, retained earnings
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: Cost = D1 ÷ P0 + G
- latex: `\text{Cost}=\dfrac{\text{D1}}{\text{P0}}+\text{G}`
- use when: Cost of equity from next dividend, price and growth
- confused with: ddm-new, capm

### ddm-new — Dividend growth model, new common stock
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: Cost = D1 ÷ (P0 × (1 − Flotation cost)) + G
- latex: `\text{Cost}=\dfrac{\text{D1}}{\text{P0}\times (1-\text{Flotation cost})}+\text{G}`
- use when: Cost of equity from a new issue with flotation costs
- confused with: ddm-re

### pref-cost — Cost of preferred stock
- subject: MS
- topic: Capital budgeting and cost of capital
- formula: Cost = Preferred dividend per share ÷ Market price or net issue price
- latex: `\text{Cost}=\dfrac{\text{Preferred dividend per share}}{\text{Market price or net issue price}}`
- use when: Cost of preferred shares

### ocb — Optimal cash balance (Baumol)
- subject: MS
- topic: Working capital and short-term credit
- formula: OCB = √((2 × Annual cash requirement × Cost per transaction) ÷ Opportunity cost of holding cash)
- latex: `\text{OCB}=\sqrt{\dfrac{2\times \text{Annual cash requirement}\times \text{Cost per transaction}}{\text{Opportunity cost of holding cash}}}`
- use when: Best size of each conversion between securities and cash
- confused with: eoq

### cash-costs — Cash balance costs
- subject: MS
- topic: Working capital and short-term credit
- formula: Holding cost = OCB ÷ 2 × Opportunity cost; Transaction cost = Annual cash requirement ÷ OCB × Cost per transaction
- latex: `\begin{aligned} \text{Holding cost}=\dfrac{\text{OCB}}{2}\times \text{Opportunity cost} \\ \text{Transaction cost}=\dfrac{\text{Annual cash requirement}}{\text{OCB}}\times \text{Cost per transaction} \end{aligned}`
- use when: Total cost of a cash management policy
- confused with: ocb

### eoq — Economic order quantity
- subject: MS
- topic: Working capital and short-term credit
- formula: EOQ = √(2aD ÷ k); Average inventory = EOQ ÷ 2
- latex: `\begin{aligned} \text{EOQ}=\sqrt{\dfrac{\text{2aD}}{\text{k}}} \\ \text{Average inventory}=\dfrac{\text{EOQ}}{2} \end{aligned}`
- use when: Order size that minimizes ordering and carrying costs
- confused with: ocb

### reorder-point — Safety stock and reorder point
- subject: MS
- topic: Working capital and short-term credit
- formula: Safety stock = (Max lead time − Normal lead time) × Average usage; Reorder point = Normal lead time usage + Safety stock
- latex: `\begin{aligned} \text{Safety stock}=(\text{Max lead time}-\text{Normal lead time})\times \text{Average usage} \\ \text{Reorder point}=\text{Normal lead time usage}+\text{Safety stock} \end{aligned}`
- use when: When to place the next order
- confused with: eoq

### discount-cost — Cost of giving up a cash discount
- subject: MS
- topic: Working capital and short-term credit
- formula: Cost = CD ÷ (100% − CD) × 360 ÷ N
- latex: `\text{Cost}=\dfrac{\text{CD}}{100\%-\text{CD}}\times \dfrac{360}{\text{N}}`
- use when: Trade credit: skip the discount and pay at the end of the credit period
- confused with: loan-no-cb

### discounted-note — Effective rate, discounted note
- subject: MS
- topic: Working capital and short-term credit
- formula: Effective rate = Interest ÷ (Principal − Discounted interest)
- latex: `\text{Effective rate}=\dfrac{\text{Interest}}{\text{Principal}-\text{Discounted interest}}`
- use when: Bank deducts interest in advance
- confused with: loan-cb

### loan-no-cb — Bank loan cost, no compensating balance
- subject: MS
- topic: Working capital and short-term credit
- formula: Cost = Discount rate ÷ (100% − Discount rate) × 360 days ÷ (Credit period − Discount period)
- latex: `\text{Cost}=\dfrac{\text{Discount rate}}{100\%-\text{Discount rate}}\times \dfrac{\text{360 days}}{\text{Credit period}-\text{Discount period}}`
- use when: Effective annual cost of short-term financing
- confused with: discount-cost, loan-cb

### loan-cb — Bank loan cost, compensating balance
- subject: MS
- topic: Working capital and short-term credit
- formula: Cost = Interest ÷ (Face value − CB)
- latex: `\text{Cost}=\dfrac{\text{Interest}}{\text{Face value}-\text{CB}}`
- use when: Bank requires part of the loan to stay on deposit
- confused with: discounted-note, loan-no-cb

### current-ratio — Current ratio
- subject: MS
- topic: Financial statement analysis
- formula: Current ratio = Current assets ÷ Current liabilities
- latex: `\text{Current ratio}=\dfrac{\text{Current assets}}{\text{Current liabilities}}`
- use when: Short-term debt-paying ability
- confused with: quick-ratio

### quick-ratio — Quick (acid-test) ratio
- subject: MS
- topic: Financial statement analysis
- formula: Quick ratio = Quick assets ÷ Current liabilities
- latex: `\text{Quick ratio}=\dfrac{\text{Quick assets}}{\text{Current liabilities}}`
- use when: Liquidity without inventories
- confused with: current-ratio

### rec-turnover — Receivables turnover
- subject: MS
- topic: Financial statement analysis
- formula: Receivables turnover = Net credit sales ÷ Average receivables
- latex: `\text{Receivables turnover}=\dfrac{\text{Net credit sales}}{\text{Average receivables}}`
- use when: Times receivables are collected in a period
- confused with: acp, inv-turnover

### acp — Average collection period
- subject: MS
- topic: Financial statement analysis
- formula: Collection period = 360 ÷ Receivables turnover
- latex: `\text{Collection period}=\dfrac{360}{\text{Receivables turnover}}`
- use when: Days to collect receivables
- confused with: rec-turnover, days-inv

### inv-turnover — Inventory turnover
- subject: MS
- topic: Financial statement analysis
- formula: Inventory turnover = Cost of goods sold ÷ Average inventory
- latex: `\text{Inventory turnover}=\dfrac{\text{Cost of goods sold}}{\text{Average inventory}}`
- use when: Times inventory is sold in a period
- confused with: rec-turnover, days-inv

### days-inv — Days in inventory
- subject: MS
- topic: Financial statement analysis
- formula: Days in inventory = 360 ÷ Inventory turnover
- latex: `\text{Days in inventory}=\dfrac{360}{\text{Inventory turnover}}`
- use when: Days inventory sits before sale
- confused with: acp, inv-turnover

### ap-turnover — Accounts payable turnover
- subject: MS
- topic: Financial statement analysis
- formula: AP turnover = Net credit purchases ÷ Average trade payables
- latex: `\text{AP turnover}=\dfrac{\text{Net credit purchases}}{\text{Average trade payables}}`
- use when: How fast the company pays suppliers
- confused with: days-payable

### days-payable — Days payable
- subject: MS
- topic: Financial statement analysis
- formula: Days payable = 360 ÷ AP turnover
- latex: `\text{Days payable}=\dfrac{360}{\text{AP turnover}}`
- use when: Days the company takes to pay suppliers
- confused with: ap-turnover

### op-cycle — Normal operating cycle
- subject: MS
- topic: Financial statement analysis
- formula: Operating cycle = Age of inventory + Age of receivables
- latex: `\text{Operating cycle}=\text{Age of inventory}+\text{Age of receivables}`
- use when: Time from buying inventory to collecting cash
- confused with: ccc

### ccc — Cash conversion cycle
- subject: MS
- topic: Financial statement analysis
- formula: Cash conversion cycle = Age of inventory + Age of receivables − Age of payables
- latex: `\text{Cash conversion cycle}=\text{Age of inventory}+\text{Age of receivables}-\text{Age of payables}`
- use when: Days cash is tied up in operations
- confused with: op-cycle

### ros — Return on sales
- subject: MS
- topic: Financial statement analysis
- formula: Return on sales = Income ÷ Net sales
- latex: `\text{Return on sales}=\dfrac{\text{Income}}{\text{Net sales}}`
- use when: Share of sales that becomes income
- confused with: roa-ratio, op-margin

### roa-ratio — Return on assets
- subject: MS
- topic: Financial statement analysis
- formula: ROA = Income ÷ Average assets
- latex: `\text{ROA}=\dfrac{\text{Income}}{\text{Average assets}}`
- use when: How well assets generate income
- confused with: roe, roi

### roe — Return on equity
- subject: MS
- topic: Financial statement analysis
- formula: ROE = Income ÷ Average equity
- latex: `\text{ROE}=\dfrac{\text{Income}}{\text{Average equity}}`
- use when: Return earned for owners
- confused with: roa-ratio

### eps-ratio — Earnings per share (ratio form)
- subject: MS
- topic: Financial statement analysis
- formula: EPS = (Net income − Preferred dividends) ÷ Weighted average common shares
- latex: `\text{EPS}=\dfrac{\text{Net income}-\text{Preferred dividends}}{\text{Weighted average common shares}}`
- use when: Income per common share
- confused with: pe, basic-eps

### op-margin — Operating profit margin
- subject: MS
- topic: Financial statement analysis
- formula: Operating margin = Operating profit ÷ Net sales
- latex: `\text{Operating margin}=\dfrac{\text{Operating profit}}{\text{Net sales}}`
- use when: Profit from operations per peso of sales
- confused with: ros, cf-margin

### cf-margin — Cash flow margin
- subject: MS
- topic: Financial statement analysis
- formula: Cash flow margin = Operating cash flow ÷ Net sales
- latex: `\text{Cash flow margin}=\dfrac{\text{Operating cash flow}}{\text{Net sales}}`
- use when: Ability to turn sales into cash
- confused with: op-margin

### pe — Price-earnings ratio
- subject: MS
- topic: Financial statement analysis
- formula: P/E = Price per share ÷ EPS
- latex: `\text{P/E}=\dfrac{\text{Price per share}}{\text{EPS}}`
- use when: Pesos paid per peso of earnings
- confused with: div-yield

### div-yield — Dividend yield
- subject: MS
- topic: Financial statement analysis
- formula: Dividend yield = Dividend per share ÷ Price per share
- latex: `\text{Dividend yield}=\dfrac{\text{Dividend per share}}{\text{Price per share}}`
- use when: Return from dividends on market price
- confused with: payout, pe

### payout — Dividend payout ratio
- subject: MS
- topic: Financial statement analysis
- formula: Payout = Dividend per share ÷ EPS
- latex: `\text{Payout}=\dfrac{\text{Dividend per share}}{\text{EPS}}`
- use when: Share of earnings paid as dividends
- confused with: div-yield

### tie — Times interest earned
- subject: MS
- topic: Financial statement analysis
- formula: TIE = EBIT ÷ Interest expense
- latex: `\text{TIE}=\dfrac{\text{EBIT}}{\text{Interest expense}}`
- use when: Ability to cover interest
- confused with: de-ratio

### de-ratio — Debt-equity ratio
- subject: MS
- topic: Financial statement analysis
- formula: Debt-equity = Total liabilities ÷ Total equity
- latex: `\text{Debt-equity}=\dfrac{\text{Total liabilities}}{\text{Total equity}}`
- use when: Creditor funds relative to owner funds
- confused with: debt-ratio, equity-ratio

### debt-ratio — Debt ratio
- subject: MS
- topic: Financial statement analysis
- formula: Debt ratio = Total liabilities ÷ Total assets
- latex: `\text{Debt ratio}=\dfrac{\text{Total liabilities}}{\text{Total assets}}`
- use when: Share of assets financed by creditors
- confused with: de-ratio, equity-ratio

### equity-ratio — Equity ratio
- subject: MS
- topic: Financial statement analysis
- formula: Equity ratio = Total equity ÷ Total assets
- latex: `\text{Equity ratio}=\dfrac{\text{Total equity}}{\text{Total assets}}`
- use when: Share of assets financed by owners
- confused with: debt-ratio, de-ratio

### ed — Elasticity of demand (midpoint)
- subject: MS
- topic: Economics
- formula: ED = (Δ quantity ÷ Average quantity) ÷ (Δ price ÷ Average price)
- latex: `\text{ED}=\dfrac{\Delta \text{quantity}\div \text{Average quantity}}{\Delta \text{price}\div \text{Average price}}`
- use when: Sensitivity of quantity demanded to price
- confused with: es

### es — Elasticity of supply
- subject: MS
- topic: Economics
- formula: ES = Δ % quantity supplied ÷ Δ % price
- latex: `\text{ES}=\dfrac{\Delta \text{\% quantity supplied}}{\Delta \text{\% price}}`
- use when: Sensitivity of quantity supplied to price
- confused with: ed

### mpc-mps — MPC and MPS
- subject: MS
- topic: Economics
- formula: MPC + MPS = 100%
- latex: `\text{MPC}+\text{MPS}=100\%`
- use when: Consumers either spend or save each extra peso

### gdp — GDP, expenditure approach
- subject: MS
- topic: Economics
- formula: GDP = C + I + G + X
- latex: `\text{GDP}=\text{C}+\text{I}+\text{G}+\text{X}`
- use when: X is net exports (exports − imports)


## AT — Auditing Theory

### audit-risk — Audit risk model
- subject: AT
- topic: Audit risk
- formula: Audit risk = Inherent risk × Control risk × Detection risk
- latex: `\text{Audit risk}=\text{Inherent risk}\times \text{Control risk}\times \text{Detection risk}`
- use when: Relationship among the components of audit risk
- confused with: detection-risk

### detection-risk — Acceptable detection risk
- subject: AT
- topic: Audit risk
- formula: Detection risk = Audit risk ÷ (Inherent risk × Control risk)
- latex: `\text{Detection risk}=\dfrac{\text{Audit risk}}{\text{Inherent risk}\times \text{Control risk}}`
- use when: Setting substantive testing from assessed risks
- confused with: audit-risk

### mpu — Mean-per-unit estimate
- subject: AT
- topic: Audit sampling
- formula: Estimate = Average sample value × Items in population
- latex: `\text{Estimate}=\text{Average sample value}\times \text{Items in population}`
- use when: Classical variables sampling without book values
- confused with: sampling-interval

### sampling-interval — Sampling interval (systematic selection)
- subject: AT
- topic: Audit sampling
- formula: Interval = Sampling units in population ÷ Sample size
- latex: `\text{Interval}=\dfrac{\text{Sampling units in population}}{\text{Sample size}}`
- use when: Choosing every nth unit
- confused with: mpu


## TAX — Taxation

### interest-deduction — Allowable interest expense
- subject: TAX
- topic: Income tax
- formula: Allowed = Interest expense − 20% × Interest income subjected to final tax
- latex: `\text{Allowed}=\text{Interest expense}-20\%\times \text{Interest income subjected to final tax}`
- use when: Interest deduction rules for business debt

### fy-rate — Fiscal-year corporation, rate change
- subject: TAX
- topic: Income tax
- formula: Tax rate applied on (Months at new rate × Taxable income) ÷ 12
- latex: `\text{Tax rate applied on}\dfrac{\text{Months at new rate}\times \text{Taxable income}}{12}`
- use when: Income taxed under two rates in one fiscal year

### rpt — Real property tax relationships
- subject: TAX
- topic: Real property tax
- formula: FMV = Assessed value ÷ Assessment level; Assessed value = FMV × Assessment level; Tax = Assessed value × Tax rate
- latex: `\begin{aligned} \text{FMV}=\dfrac{\text{Assessed value}}{\text{Assessment level}} \\ \text{Assessed value}=\text{FMV}\times \text{Assessment level} \\ \text{Tax}=\text{Assessed value}\times \text{Tax rate} \end{aligned}`
- use when: Real property tax assessment


## RFBT — Regulatory Framework for Business Transactions

### outstanding-cs — Outstanding capital stock
- subject: RFBT
- topic: Corporation law
- formula: Outstanding capital stock = Issued + Subscribed − Treasury − Delinquent shares
- latex: `\text{Outstanding capital stock}=\text{Issued}+\text{Subscribed}-\text{Treasury}-\text{Delinquent shares}`
- use when: Quorum for stockholders' meetings

### cumulative-voting — Cumulative voting, shares to elect one director
- subject: RFBT
- topic: Corporation law
- formula: Shares needed = S ÷ (D + 1) + 1
- latex: `\text{Shares needed}=\dfrac{\text{S}}{\text{D}+1}+1`
- use when: S is shares voting; D is directors to be elected

### coop-interest — Cooperative interest on share capital
- subject: RFBT
- topic: Cooperatives
- formula: Rate = (X × (Net surplus − Statutory reserves)) ÷ Total average share month
- latex: `\text{Rate}=\dfrac{\text{X}\times (\text{Net surplus}-\text{Statutory reserves})}{\text{Total average share month}}`
- use when: X is the percentage the Board allocates to interest
