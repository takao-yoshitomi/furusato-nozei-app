import math

def get_salary_income_deduction(salary):
    """給与所得控除額を計算します。"""
    if salary <= 1625000:
        return 550000
    elif salary <= 1800000:
        return salary * 0.4 - 100000
    elif salary <= 3600000:
        return salary * 0.3 + 80000
    elif salary <= 6600000:
        return salary * 0.2 + 440000
    elif salary <= 8500000:
        return salary * 0.1 + 1100000
    else:
        return 1950000

def get_income_tax_rate(taxable_income):
    """課税所得に応じた所得税率を返します。"""
    if taxable_income <= 1950000:
        return 0.05
    elif taxable_income <= 3300000:
        return 0.10
    elif taxable_income <= 6950000:
        return 0.20
    elif taxable_income <= 9000000:
        return 0.23
    elif taxable_income <= 18000000:
        return 0.33
    elif taxable_income <= 40000000:
        return 0.40
    else:
        return 0.45

def main():
    """メインの処理"""
    try:
        # 1. 年収の質問
        salary = int(input("給与収入（年収）を円単位で入力してください: "))

        # 2. 社会保険料控除額の質問
        social_insurance_premium_deduction_input = input("社会保険料等の控除額を入力してください（不明な場合はEnterキーを押すと年収の15%で概算します）: ")
        if social_insurance_premium_deduction_input == "":
            social_insurance_premium_deduction = salary * 0.15
            print(f"社会保険料控除額を、年収の15%（{int(social_insurance_premium_deduction)}円）として計算します。")
        else:
            social_insurance_premium_deduction = int(social_insurance_premium_deduction_input)

        # 3. 扶養家族の情報の質問
        spouse_deduction_type = input("配偶者控除の有無を選択してください（なし / あり（一般） / あり（70歳以上））: ")
        spouse_deduction = 0
        if spouse_deduction_type == "あり（一般）":
            spouse_deduction = 380000
        elif spouse_deduction_type == "あり（70歳以上）":
            spouse_deduction = 480000

        dependents_count = int(input("扶養家族（16歳以上）の人数を入力してください: "))
        dependent_deduction = dependents_count * 380000

        # 4. その他の控除の質問
        other_deductions = int(input("生命保険料控除、地震保険料控除、医療費控除などの合計額を入力してください（不明な場合は0）: "))

        # 5. 計算の実行
        # 給与所得控除
        salary_income_deduction = get_salary_income_deduction(salary)

        # 基礎控除
        basic_deduction = 480000

        # 課税所得
        taxable_income = salary - salary_income_deduction - social_insurance_premium_deduction - spouse_deduction - dependent_deduction - basic_deduction - other_deductions
        if taxable_income < 0:
            taxable_income = 0

        # 住民税所得割額
        municipal_tax = taxable_income * 0.1

        # 所得税率
        income_tax_rate = get_income_tax_rate(taxable_income)

        # 控除上限額
        # (住民税所得割額 × 20%) / (100% - 住民税率10% - (所得税率 × 復興特別所得税率1.021)) + 2000円
        # 復興特別所得税を考慮した所得税率
        effective_income_tax_rate = income_tax_rate * 1.021
        
        # 自己負担額2000円を考慮しない上限額
        limit_amount_numerator = municipal_tax * 0.2
        limit_amount_denominator = 0.9 - effective_income_tax_rate
        
        if limit_amount_denominator <= 0:
            # 所得税率が非常に高い場合、計算上マイナスになる可能性があるため
            # その場合は、実質的に住民税の20%が上限となる
            deduction_limit = municipal_tax * 0.2 + 2000
        else:
            deduction_limit = (limit_amount_numerator / limit_amount_denominator) + 2000


        # 6. 結果の表示
        print("\n---")
        print(f"あなたのふるさと納税の控除上限額の目安は、約{math.floor(deduction_limit / 1000) * 1000:,.0f}円です。")

    except ValueError:
        print("エラー: 数値を入力してください。")
    except Exception as e:
        print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    main()
