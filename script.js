document.addEventListener('DOMContentLoaded', function() {

    const calculateBtn = document.getElementById('calculate-btn');
    const printBtn = document.getElementById('print-btn');
    const resultWrapper = document.getElementById('result-wrapper');

    calculateBtn.addEventListener('click', function() {

        // 入力値の取得
        const salary = parseInt(document.getElementById('salary').value) || 0;
        const otherIncome = parseInt(document.getElementById('other-income').value) || 0;
        let socialInsurance = parseInt(document.getElementById('social-insurance').value);
        const spouseDeductionType = document.getElementById('spouse-deduction').value;
        const dependents = parseInt(document.getElementById('dependents').value) || 0;
        const otherDeductions = parseInt(document.getElementById('other-deductions').value) || 0;

        if (salary === 0 && otherIncome === 0) {
            alert('収入を入力してください。');
            return;
        }

        // --- 計算ロジック ---
        let socialInsuranceNote = '（入力値）';
        if (isNaN(socialInsurance)) {
            const isLongTermCare = document.getElementById('long-term-care-insurance').checked;
            if (isLongTermCare) {
                socialInsurance = salary * 0.15;
                socialInsuranceNote = '（概算: 給与収入の15%）';
            } else {
                socialInsurance = salary * 0.143;
                socialInsuranceNote = '（概算: 給与収入の14.3%）';
            }
        }

        let spouseDeduction = 0;
        if (spouseDeductionType === 'general') spouseDeduction = 380000;
        else if (spouseDeductionType === 'senior') spouseDeduction = 480000;

        const dependentDeduction = dependents * 380000;

        function getSalaryIncomeDeduction(s) {
            if (s <= 1625000) return 550000;
            if (s <= 1800000) return s * 0.4 - 100000;
            if (s <= 3600000) return s * 0.3 + 80000;
            if (s <= 6600000) return s * 0.2 + 440000;
            if (s <= 8500000) return s * 0.1 + 1100000;
            return 1950000;
        }
        const salaryIncomeDeduction = salary > 0 ? getSalaryIncomeDeduction(salary) : 0;

        let salaryDeductionFormula = '給与収入がないため、控除はありません。';
        if (salary > 0) {
            if (salary <= 1625000) salaryDeductionFormula = '550,000円';
            else if (salary <= 1800000) salaryDeductionFormula = `${salary.toLocaleString()}円 × 40% - 100,000円`;
            else if (salary <= 3600000) salaryDeductionFormula = `${salary.toLocaleString()}円 × 30% + 80,000円`;
            else if (salary <= 6600000) salaryDeductionFormula = `${salary.toLocaleString()}円 × 20% + 440,000円`;
            else if (salary <= 8500000) salaryDeductionFormula = `${salary.toLocaleString()}円 × 10% + 1,100,000円`;
            else salaryDeductionFormula = '1,950,000円';
        }

        const basicDeduction = 480000;
        
        const totalIncome = salary + otherIncome;
        const totalDeductions = salaryIncomeDeduction + socialInsurance + spouseDeduction + dependentDeduction + otherDeductions + basicDeduction;

        let taxableIncome = totalIncome - totalDeductions;
        if (taxableIncome < 0) taxableIncome = 0;

        const municipalTax = taxableIncome * 0.1;

        function getIncomeTaxRate(ti) {
            if (ti <= 1950000) return 0.05;
            if (ti <= 3300000) return 0.10;
            if (ti <= 6950000) return 0.20;
            if (ti <= 9000000) return 0.23;
            if (ti <= 18000000) return 0.33;
            if (ti <= 40000000) return 0.40;
            return 0.45;
        }
        const incomeTaxRate = getIncomeTaxRate(taxableIncome);

        const effectiveIncomeTaxRate = incomeTaxRate * 1.021;
        const limitAmountNumerator = municipalTax * 0.2;
        const limitAmountDenominator = 0.9 - effectiveIncomeTaxRate;
        let deductionLimit = 0;
        if (limitAmountDenominator > 0) {
            deductionLimit = (limitAmountNumerator / limitAmountDenominator) + 2000;
        }

        // --- 結果表示 ---
        const resultDiv = document.getElementById('result');
        const roundedLimit = Math.floor(deductionLimit / 1000) * 1000;
        resultDiv.innerHTML = `
            <p class="mb-1">あなたの控除上限額の目安は</p>
            <p class="display-4 fw-bold text-primary">約 ${roundedLimit.toLocaleString()} 円</p>
        `;

        // --- 計算過程表示 ---
        const detailsDiv = document.getElementById('calculation-details');
        const limitCalculationHTML = `
            <div class="text-center p-3 bg-light rounded mt-3">
                <p class="fw-bold mb-1">控除上限額の計算式</p>
                <p class="font-monospace mb-2 small"> (住民税所得割額 × 20%) / (90% - 実効所得税率) + 2,000円 </p>
                <hr>
                <p class="font-monospace small">
                    (${Math.round(municipalTax).toLocaleString()}円 × 20%) / (90% - ${(effectiveIncomeTaxRate * 100).toFixed(3)}%) + 2,000円
                    = <strong>約 ${Math.round(deductionLimit).toLocaleString()} 円</strong>
                </p>
            </div>
        `;
        detailsDiv.innerHTML = `
            <ul class="list-group list-group-flush">
                <li class="list-group-item list-group-item-secondary fw-bold">収入</li>
                <li class="list-group-item d-flex justify-content-between align-items-center"><span>給与収入</span> <span>${salary.toLocaleString()} 円</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center"><span>その他所得</span> <span>${otherIncome.toLocaleString()} 円</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center fw-bold"><span>総収入</span> <span>${totalIncome.toLocaleString()} 円</span></li>
                
                <li class="list-group-item list-group-item-secondary fw-bold mt-3">所得控除</li>
                <li class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>給与所得控除</span>
                        <span>-${salaryIncomeDeduction.toLocaleString()} 円</span>
                    </div>
                    <div class="form-text text-end"><small>${salaryDeductionFormula}</small></div>
                </li>
                <li class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>社会保険料控除</span>
                        <span>-${Math.round(socialInsurance).toLocaleString()} 円</span>
                    </div>
                    <div class="form-text text-end"><small>${socialInsuranceNote}</small></div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center"><span>配偶者・扶養控除</span> <span>-${(spouseDeduction + dependentDeduction).toLocaleString()} 円</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center"><span>その他控除</span> <span>-${otherDeductions.toLocaleString()} 円</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center"><span>基礎控除</span> <span>-${basicDeduction.toLocaleString()} 円</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center fw-bold"><span>所得控除 合計</span> <span>-${totalDeductions.toLocaleString()} 円</span></li>

                <li class="list-group-item list-group-item-secondary fw-bold mt-3">税額計算</li>
                <li class="list-group-item d-flex justify-content-between align-items-center fw-bold"><span>課税所得金額</span> <span class="badge bg-success rounded-pill fs-6">${taxableIncome.toLocaleString()} 円</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center"><span>住民税所得割額</span> <span class="badge bg-info text-dark rounded-pill fs-6">${Math.round(municipalTax).toLocaleString()} 円</span></li>
                <li class="list-group-item">${limitCalculationHTML}</li>
            </ul>
        `;

        // --- アニメーションと表示 ---
        resultWrapper.classList.remove('d-none');
        printBtn.classList.remove('d-none');
    });

    // --- 印刷機能 ---
    printBtn.addEventListener('click', function() {
        window.print();
    });

    
});