#!/usr/bin/env python3
"""
Standalone script to seed/flush mock data
Usage:
    python seed_data.py seed    # Add mock data
    python seed_data.py flush   # Remove mock data
    python seed_data.py reset   # Flush then seed
    python seed_data.py stats   # Show current stats
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.mock_data import mock_manager

def main():
    if len(sys.argv) != 2:
        print("Usage: python seed_data.py [seed|flush|reset|stats]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    app = create_app()
    
    with app.app_context():
        if command == "seed":
            count = mock_manager.seed_all()
            print(f"✅ Seeded {count} mock objects")
            print(f"📊 Stats: {mock_manager.get_stats()}")
            
        elif command == "flush":
            count = mock_manager.flush_all()
            print(f"🗑️ Removed {count} mock objects")
            print(f"📊 Stats: {mock_manager.get_stats()}")
            
        elif command == "reset":
            flush_count = mock_manager.flush_all()
            seed_count = mock_manager.seed_all()
            print(f"🔄 Reset complete: Removed {flush_count}, Added {seed_count}")
            print(f"📊 Stats: {mock_manager.get_stats()}")
            
        elif command == "stats":
            stats = mock_manager.get_stats()
            print("📊 Current Mock Data Stats:")
            for key, value in stats.items():
                print(f"   {key}: {value}")
            print(f"   Total: {sum(stats.values())}")
            
        else:
            print(f"❌ Unknown command: {command}")
            print("Available commands: seed, flush, reset, stats")
            sys.exit(1)

if __name__ == "__main__":
    main()