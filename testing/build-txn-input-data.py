import csv
import random
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()

def generate_transactions_csv(filename: str, num_rows: int = 100):
    categories = {
        1: "Groceries",
        2: "Utilities",
        3: "Entertainment",
        4: "Transport",
        5: "Healthcare",
        6: "Dining Out",
        7: "Education"
    }

    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['amount', 'category_id', 'transaction_date', 'description'])

        for _ in range(num_rows):
            amount = round(random.uniform(-500, 500), 2)  # positive and negative transactions
            category_id = random.choice(list(categories.keys()))
            days_ago = random.randint(0, 180)
            transaction_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
            description = fake.sentence(nb_words=random.randint(2, 6))

            writer.writerow([amount, category_id, transaction_date, description])

    print(f"{num_rows} fake transactions written to {filename}")

# Example usage
generate_transactions_csv('fake_transactions.csv', num_rows=50)
