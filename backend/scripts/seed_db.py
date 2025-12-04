import sys
import os
from sqlmodel import Session, select

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.db import engine, create_db_and_tables
from app.models.sql import PayerConfig, ChannelPreference

def seed_data():
    print("Initializing database...")
    create_db_and_tables()
    
    with Session(engine) as session:
        # Check if data exists
        statement = select(PayerConfig)
        results = session.exec(statement).all()
        
        if results:
            print(f"Found {len(results)} existing payer configs. Skipping seed.")
            return

        print("Seeding payer configurations...")
        
        payers = [
            PayerConfig(
                name="Aetna",
                payer_code_hint="60054", # Stedi Sandbox Aetna Payer ID
                stedi_supported=True,
                rpa_supported=False,
                preferred_channel=ChannelPreference.STEDI
            ),
            PayerConfig(
                name="Cigna",
                payer_code_hint="62308", # Stedi Sandbox Cigna Payer ID
                stedi_supported=True,
                rpa_supported=False,
                preferred_channel=ChannelPreference.STEDI
            ),
            PayerConfig(
                name="FAKE_LOCAL_PPO",
                payer_code_hint=None,
                stedi_supported=False,
                rpa_supported=True,
                preferred_channel=ChannelPreference.RPA
            ),
             PayerConfig(
                name="Test Payer", # Matches the mock scenario
                payer_code_hint="PAYER123",
                stedi_supported=True,
                rpa_supported=False,
                preferred_channel=ChannelPreference.STEDI
            )
        ]
        
        for payer in payers:
            session.add(payer)
            
        session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
