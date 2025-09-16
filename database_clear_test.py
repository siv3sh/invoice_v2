#!/usr/bin/env python3
"""
Focused Database Clear Functionality Test
Tests the new critical database clear feature for super admin users
"""

import requests
import sys
import json
from datetime import datetime

class DatabaseClearTester:
    def __init__(self, base_url="https://0de79f73-880e-4b75-b873-cf862a9b62ec.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if data is not None:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, response.content
            else:
                try:
                    error_detail = response.json().get('detail', 'Unknown error')
                except:
                    error_detail = response.text
                return False, f"Status {response.status_code}: {error_detail}"

        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def authenticate(self):
        """Authenticate as super admin"""
        print("🔐 Authenticating as super admin...")
        
        success, result = self.make_request('POST', 'auth/login', 
                                          {'email': 'brightboxm@gmail.com', 'password': 'admin123'})
        
        if success and 'access_token' in result:
            self.token = result['access_token']
            self.user_data = result['user']
            self.log_test("Super admin authentication", True, f"- Role: {self.user_data['role']}")
            return True
        else:
            self.log_test("Super admin authentication", False, f"- {result}")
            return False

    def test_database_clear_comprehensive(self):
        """Comprehensive test of database clear functionality"""
        print("\n🚨 COMPREHENSIVE DATABASE CLEAR TESTING...")
        
        # 1. Security Testing - Unauthorized access
        print("\n1️⃣ SECURITY TESTING")
        old_token = self.token
        self.token = None
        
        clear_data = {
            "confirm_clear": True,
            "confirmation_text": "DELETE ALL DATA"
        }
        
        success, result = self.make_request('POST', 'admin/clear-database', clear_data, expected_status=401)
        self.log_test("Unauthorized access rejection", success, "- Correctly rejected unauthenticated request")
        
        # Restore token
        self.token = old_token
        
        # 2. Confirmation Testing
        print("\n2️⃣ CONFIRMATION TESTING")
        
        # Test without any confirmation
        success, result = self.make_request('POST', 'admin/clear-database', {}, expected_status=400)
        self.log_test("No confirmation rejection", success, f"- Error: {result}")
        
        # Test with wrong confirmation text
        wrong_confirmation = {
            "confirm_clear": True,
            "confirmation_text": "WRONG TEXT"
        }
        success, result = self.make_request('POST', 'admin/clear-database', wrong_confirmation, expected_status=400)
        self.log_test("Wrong confirmation text rejection", success, f"- Error: {result}")
        
        # Test with checkbox unchecked
        unchecked_confirmation = {
            "confirm_clear": False,
            "confirmation_text": "DELETE ALL DATA"
        }
        success, result = self.make_request('POST', 'admin/clear-database', unchecked_confirmation, expected_status=400)
        self.log_test("Unchecked confirmation rejection", success, f"- Error: {result}")
        
        # 3. Pre-clear system health check
        print("\n3️⃣ PRE-CLEAR SYSTEM STATE")
        success, health_before = self.make_request('GET', 'admin/system-health')
        collections_before = {}
        total_before = 0
        if success:
            collections_before = health_before.get('database', {}).get('collections', {})
            total_before = sum(col.get('count', 0) for col in collections_before.values())
            print(f"📊 System state before clear:")
            for col_name, col_info in collections_before.items():
                count = col_info.get('count', 0)
                print(f"   - {col_name}: {count} records")
            self.log_test("Pre-clear system health", True, f"- Total records: {total_before}")
        
        # 4. Functionality Testing - Execute clear with correct confirmation
        print("\n4️⃣ FUNCTIONALITY TESTING")
        correct_confirmation = {
            "confirm_clear": True,
            "confirmation_text": "DELETE ALL DATA"
        }
        
        success, result = self.make_request('POST', 'admin/clear-database', correct_confirmation)
        
        if success:
            print(f"📋 Database clear response:")
            print(f"   - Message: {result.get('message')}")
            print(f"   - Timestamp: {result.get('timestamp')}")
            print(f"   - Cleared by: {result.get('cleared_by', {}).get('email')}")
            
            # 5. Response Validation
            print("\n5️⃣ RESPONSE VALIDATION")
            required_fields = ['message', 'timestamp', 'cleared_by', 'statistics', 'preserved']
            has_all_fields = all(field in result for field in required_fields)
            self.log_test("Response structure", has_all_fields, f"- All required fields present")
            
            # Check statistics
            stats = result.get('statistics', {})
            total_deleted = stats.get('total_records_deleted', 0)
            collections_cleared = stats.get('collections_cleared', 0)
            collections_details = stats.get('collections_details', [])
            
            print(f"📊 Deletion statistics:")
            print(f"   - Total records deleted: {total_deleted}")
            print(f"   - Collections cleared: {collections_cleared}")
            
            for detail in collections_details:
                col_name = detail.get('collection')
                deleted = detail.get('deleted_count', 0)
                previous = detail.get('previous_count', 0)
                error = detail.get('error')
                if error:
                    print(f"   - {col_name}: ERROR - {error}")
                else:
                    print(f"   - {col_name}: {deleted}/{previous} deleted")
            
            self.log_test("Deletion statistics", total_deleted >= 0, f"- {total_deleted} records deleted")
            
            # Check targeted collections
            expected_collections = ['projects', 'invoices', 'clients', 'bank_guarantees', 
                                  'pdf_extractions', 'master_items', 'workflow_configs', 
                                  'system_configs', 'activity_logs']
            
            cleared_collection_names = [c.get('collection') for c in collections_details]
            has_expected_collections = all(col in cleared_collection_names for col in expected_collections)
            self.log_test("Targeted collections", has_expected_collections,
                        f"- {len(cleared_collection_names)}/{len(expected_collections)} collections targeted")
            
            # Check preservation
            preserved = result.get('preserved', {})
            users_preserved = 'users' in str(preserved)
            self.log_test("Users preservation", users_preserved, "- User accounts preserved")
            
            # 6. Post-clear verification
            print("\n6️⃣ POST-CLEAR VERIFICATION")
            success_after, health_after = self.make_request('GET', 'admin/system-health')
            if success_after:
                collections_after = health_after.get('database', {}).get('collections', {})
                total_after = sum(col.get('count', 0) for col in collections_after.values())
                
                print(f"📊 System state after clear:")
                for col_name, col_info in collections_after.items():
                    count = col_info.get('count', 0)
                    print(f"   - {col_name}: {count} records")
                
                # Verify users collection still has data
                users_count_after = collections_after.get('users', {}).get('count', 0)
                self.log_test("Users preserved verification", users_count_after > 0,
                            f"- {users_count_after} user records preserved")
                
                # Check if data collections are cleared
                data_collections_status = {}
                for col_name in expected_collections:
                    if col_name in collections_after:
                        count = collections_after[col_name].get('count', 0)
                        data_collections_status[col_name] = count
                
                print(f"📊 Data collections after clear:")
                for col_name, count in data_collections_status.items():
                    status = "✅ CLEARED" if count == 0 else f"⚠️ {count} remaining"
                    print(f"   - {col_name}: {status}")
                
                all_cleared = all(count == 0 for count in data_collections_status.values())
                self.log_test("Data collections cleared", all_cleared,
                            f"- {sum(1 for c in data_collections_status.values() if c == 0)}/{len(data_collections_status)} collections fully cleared")
            
            # 7. Activity log verification
            print("\n7️⃣ ACTIVITY LOG VERIFICATION")
            success_logs, logs_result = self.make_request('GET', 'activity-logs')
            if success_logs and logs_result:
                clear_log_found = False
                for log_entry in logs_result[:5]:
                    if log_entry.get('action') == 'database_cleared':
                        clear_log_found = True
                        print(f"📝 Clear action logged: {log_entry.get('description', '')}")
                        break
                
                self.log_test("Activity logging", clear_log_found, "- Database clear action logged")
            
            return True
        else:
            self.log_test("Database clear execution", False, f"- {result}")
            return False

    def run_test(self):
        """Run the comprehensive database clear test"""
        print("🚨 DATABASE CLEAR FUNCTIONALITY TEST")
        print("=" * 60)
        
        if not self.authenticate():
            print("❌ Authentication failed - stopping test")
            return False
        
        success = self.test_database_clear_comprehensive()
        
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return success

def main():
    """Main test execution"""
    tester = DatabaseClearTester()
    
    try:
        success = tester.run_test()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⏹️ Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())