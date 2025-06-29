from faker import Faker
from uuid import uuid4

fake = Faker()

def generate_synthetic_data(partner_id=None):
    return {
        "name": fake.name(),
        "email": fake.email(),  # Could be a honeytoken
        "phone": fake.phone_number(),
        "region": fake.country(),
        "record_id": str(uuid4())
    } 