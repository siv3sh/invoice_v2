#!/usr/bin/env python3
"""
Critical Invoice Sync Testing for Activus Invoice Management System
Tests the specific sync fixes mentioned in the review request:
1. Invoice Data Synchronization
2. Project Details Refresh
3. Search and Filter Functionality  
4. RA Logic Separation
"""

import requests
import sys
import json
import time
from datetime import datetime

class InvoiceSyncTester:
    def __init__(self, base_url="https://0de79f73-880e-4b75-b873-cf862a9b62ec.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_client_id = None
        self.test_project_id = None
        self.created_invoices = []

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
            elif method == 'PUT':
                response = requests.put(url, headers=headers, json=data)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
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

    def setup_test_data(self):
        """Setup test data - authenticate and create client/project"""
        print("\n🔧 Setting up test data...")
        
        # Login
        success, result = self.make_request('POST', 'auth/login', 
                                          {'email': 'brightboxm@gmail.com', 'password': 'admin123'})
        
        if success and 'access_token' in result:
            self.token = result['access_token']
            self.user_data = result['user']
            self.log_test("Authentication", True, f"- Logged in as {self.user_data['role']}")
        else:
            self.log_test("Authentication", False, f"- {result}")
            return False

        # Create test client
        client_data = {
            "name": "Sync Test Client Ltd",
            "gst_no": "29ABCDE1234F1Z5",
            "bill_to_address": "123 Sync Test Street, Bangalore, Karnataka - 560001",
            "contact_person": "Test Manager",
            "phone": "+91-9876543210",
            "email": "test@syncclient.com"
        }
        
        success, result = self.make_request('POST', 'clients', client_data)
        if success and 'client_id' in result:
            self.test_client_id = result['client_id']
            self.log_test("Test client creation", True, f"- Client ID: {self.test_client_id}")
        else:
            self.log_test("Test client creation", False, f"- {result}")
            return False

        # Create test project
        project_data = {
            "project_name": "Invoice Sync Test Project",
            "architect": "Sync Test Architect",
            "client_id": self.test_client_id,
            "client_name": "Sync Test Client Ltd",
            "location": "Bangalore, Karnataka",
            "metadata": {
                "project_name": "Invoice Sync Test Project",
                "architect": "Sync Test Architect",
                "client": "Sync Test Client Ltd",
                "location": "Bangalore, Karnataka"
            },
            "boq_items": [
                {
                    "serial_number": "1",
                    "description": "Foundation Excavation Work",
                    "unit": "Cum",
                    "quantity": 100,
                    "rate": 500,
                    "amount": 50000,
                    "gst_rate": 18.0
                },
                {
                    "serial_number": "2", 
                    "description": "Concrete Pouring M20 Grade",
                    "unit": "Cum",
                    "quantity": 50,
                    "rate": 4500,
                    "amount": 225000,
                    "gst_rate": 18.0
                },
                {
                    "serial_number": "3",
                    "description": "Steel Reinforcement TMT Bars",
                    "unit": "Kg",
                    "quantity": 2000,
                    "rate": 65,
                    "amount": 130000,
                    "gst_rate": 18.0
                }
            ],
            "total_project_value": 405000,
            "advance_received": 50000,
            "created_by": self.user_data['id']
        }
        
        success, result = self.make_request('POST', 'projects', project_data)
        if success and 'project_id' in result:
            self.test_project_id = result['project_id']
            self.log_test("Test project creation", True, f"- Project ID: {self.test_project_id}")
            return True
        else:
            self.log_test("Test project creation", False, f"- {result}")
            return False

    def test_invoice_data_synchronization(self):
        """Test 1: Invoice Data Synchronization - create invoice and verify it appears in both places"""
        print("\n📋 Testing Invoice Data Synchronization...")
        
        if not self.test_project_id or not self.test_client_id:
            self.log_test("Invoice sync test setup", False, "- Missing test project or client")
            return False

        # Get initial project details to compare later
        success, initial_project_details = self.make_request('GET', f'projects/{self.test_project_id}/details')
        if not success:
            self.log_test("Get initial project details", False, f"- {initial_project_details}")
            return False
        
        initial_invoice_count = len(initial_project_details.get('invoices', []))
        self.log_test("Get initial project state", True, f"- Initial invoices: {initial_invoice_count}")

        # Create a TAX INVOICE (should get RA number)
        tax_invoice_data = {
            "project_id": self.test_project_id,
            "project_name": "Invoice Sync Test Project",
            "client_id": self.test_client_id,
            "client_name": "Sync Test Client Ltd",
            "invoice_type": "tax_invoice",
            "items": [
                {
                    "boq_item_id": "1",
                    "serial_number": "1",
                    "description": "Foundation Excavation Work - Partial Bill",
                    "unit": "Cum",
                    "quantity": 30,  # Partial quantity
                    "rate": 500,
                    "amount": 15000,
                    "gst_rate": 18.0,
                    "gst_amount": 2700,
                    "total_with_gst": 17700
                }
            ],
            "subtotal": 15000,
            "total_gst_amount": 2700,
            "total_amount": 17700,
            "status": "draft",
            "include_tax": True,
            "payment_terms": "30 days from invoice date",
            "advance_received": 0,
            "created_by": self.user_data['id']
        }
        
        success, tax_invoice_result = self.make_request('POST', 'invoices', tax_invoice_data)
        if success and 'invoice_id' in tax_invoice_result:
            tax_invoice_id = tax_invoice_result['invoice_id']
            self.created_invoices.append(tax_invoice_id)
            self.log_test("Create TAX invoice", True, f"- Invoice ID: {tax_invoice_id}")
            
            # Verify RA number was assigned
            success, invoice_details = self.make_request('GET', f'invoices/{tax_invoice_id}')
            if success:
                ra_number = invoice_details.get('ra_number', '')
                has_ra_number = ra_number.startswith('RA') and ra_number != ''
                self.log_test("TAX invoice RA number assignment", has_ra_number, 
                            f"- RA Number: {ra_number}")
            else:
                self.log_test("Get TAX invoice details", False, f"- {invoice_details}")
        else:
            self.log_test("Create TAX invoice", False, f"- {tax_invoice_result}")
            return False

        # Create a PROFORMA INVOICE (should NOT get RA number)
        proforma_invoice_data = {
            "project_id": self.test_project_id,
            "project_name": "Invoice Sync Test Project", 
            "client_id": self.test_client_id,
            "client_name": "Sync Test Client Ltd",
            "invoice_type": "proforma",
            "items": [
                {
                    "boq_item_id": "2",
                    "serial_number": "2",
                    "description": "Concrete Pouring M20 Grade - Estimate",
                    "unit": "Cum",
                    "quantity": 20,  # Partial quantity
                    "rate": 4500,
                    "amount": 90000,
                    "gst_rate": 0.0,  # Proforma without tax
                    "gst_amount": 0,
                    "total_with_gst": 90000
                }
            ],
            "subtotal": 90000,
            "total_gst_amount": 0,
            "total_amount": 90000,
            "status": "draft",
            "include_tax": False,  # Proforma without tax
            "payment_terms": "Advance payment required",
            "advance_received": 0,
            "created_by": self.user_data['id']
        }
        
        success, proforma_result = self.make_request('POST', 'invoices', proforma_invoice_data)
        if success and 'invoice_id' in proforma_result:
            proforma_invoice_id = proforma_result['invoice_id']
            self.created_invoices.append(proforma_invoice_id)
            self.log_test("Create PROFORMA invoice", True, f"- Invoice ID: {proforma_invoice_id}")
            
            # Verify NO RA number was assigned
            success, invoice_details = self.make_request('GET', f'invoices/{proforma_invoice_id}')
            if success:
                ra_number = invoice_details.get('ra_number', '')
                no_ra_number = ra_number == '' or ra_number is None
                self.log_test("PROFORMA invoice NO RA number", no_ra_number, 
                            f"- RA Number: '{ra_number}' (should be empty)")
            else:
                self.log_test("Get PROFORMA invoice details", False, f"- {invoice_details}")
        else:
            self.log_test("Create PROFORMA invoice", False, f"- {proforma_result}")
            return False

        return True

    def test_project_details_refresh(self):
        """Test 2: Project Details Refresh - verify project view shows new invoices immediately"""
        print("\n🔄 Testing Project Details Refresh...")
        
        if not self.test_project_id:
            self.log_test("Project refresh test", False, "- No test project available")
            return False

        # Get updated project details after invoice creation
        success, updated_project_details = self.make_request('GET', f'projects/{self.test_project_id}/details')
        if not success:
            self.log_test("Get updated project details", False, f"- {updated_project_details}")
            return False

        # Verify invoices appear in project details
        project_invoices = updated_project_details.get('invoices', [])
        expected_invoice_count = len(self.created_invoices)
        actual_invoice_count = len(project_invoices)
        
        invoices_synced = actual_invoice_count >= expected_invoice_count
        self.log_test("Project invoices synchronization", invoices_synced, 
                    f"- Expected: {expected_invoice_count}, Found: {actual_invoice_count}")

        # Verify financial calculations are updated
        financial_summary = updated_project_details.get('financial_summary', {})
        total_invoiced = financial_summary.get('total_invoiced', 0)
        total_invoices = financial_summary.get('total_invoices', 0)
        
        financial_updated = total_invoiced > 0 and total_invoices > 0
        self.log_test("Financial calculations updated", financial_updated,
                    f"- Total invoiced: ₹{total_invoiced}, Invoice count: {total_invoices}")

        # Verify invoice types are properly categorized
        tax_invoices = [inv for inv in project_invoices if inv.get('invoice_type') == 'tax_invoice']
        proforma_invoices = [inv for inv in project_invoices if inv.get('invoice_type') == 'proforma']
        
        has_both_types = len(tax_invoices) > 0 and len(proforma_invoices) > 0
        self.log_test("Invoice type categorization", has_both_types,
                    f"- Tax invoices: {len(tax_invoices)}, Proforma: {len(proforma_invoices)}")

        # Verify RA numbers in project view
        tax_with_ra = [inv for inv in tax_invoices if inv.get('ra_number', '').startswith('RA')]
        proforma_without_ra = [inv for inv in proforma_invoices if not inv.get('ra_number', '')]
        
        ra_logic_correct = len(tax_with_ra) == len(tax_invoices) and len(proforma_without_ra) == len(proforma_invoices)
        self.log_test("RA numbering in project view", ra_logic_correct,
                    f"- Tax with RA: {len(tax_with_ra)}/{len(tax_invoices)}, Proforma without RA: {len(proforma_without_ra)}/{len(proforma_invoices)}")

        return invoices_synced and financial_updated

    def test_search_and_filter_functionality(self):
        """Test 3: Search and Filter Functionality in Invoices"""
        print("\n🔍 Testing Search and Filter Functionality...")
        
        # Test basic invoice listing
        success, all_invoices = self.make_request('GET', 'invoices')
        if not success:
            self.log_test("Get all invoices", False, f"- {all_invoices}")
            return False
        
        total_invoices = len(all_invoices)
        self.log_test("Get all invoices", True, f"- Found {total_invoices} total invoices")

        # Test search functionality (if implemented)
        search_term = "Sync Test"
        success, search_results = self.make_request('GET', f'invoices?search={search_term}')
        if success:
            search_count = len(search_results)
            found_test_invoices = any(search_term.lower() in inv.get('project_name', '').lower() 
                                    for inv in search_results)
            self.log_test("Invoice search functionality", found_test_invoices,
                        f"- Found {search_count} invoices matching '{search_term}'")
        else:
            self.log_test("Invoice search functionality", False, f"- Search not implemented or failed: {search_results}")

        # Test filter by invoice type - TAX invoices
        success, tax_invoices = self.make_request('GET', 'invoices?type=tax_invoice')
        if success:
            tax_count = len(tax_invoices)
            all_are_tax = all(inv.get('invoice_type') == 'tax_invoice' for inv in tax_invoices)
            self.log_test("Filter by TAX invoice type", all_are_tax,
                        f"- Found {tax_count} tax invoices, all correctly filtered: {all_are_tax}")
        else:
            self.log_test("Filter by TAX invoice type", False, f"- {tax_invoices}")

        # Test filter by invoice type - PROFORMA invoices  
        success, proforma_invoices = self.make_request('GET', 'invoices?type=proforma')
        if success:
            proforma_count = len(proforma_invoices)
            all_are_proforma = all(inv.get('invoice_type') == 'proforma' for inv in proforma_invoices)
            self.log_test("Filter by PROFORMA invoice type", all_are_proforma,
                        f"- Found {proforma_count} proforma invoices, all correctly filtered: {all_are_proforma}")
        else:
            self.log_test("Filter by PROFORMA invoice type", False, f"- {proforma_invoices}")

        # Test filter by project
        success, project_invoices = self.make_request('GET', f'invoices?project_id={self.test_project_id}')
        if success:
            project_invoice_count = len(project_invoices)
            all_from_project = all(inv.get('project_id') == self.test_project_id for inv in project_invoices)
            self.log_test("Filter by project", all_from_project,
                        f"- Found {project_invoice_count} invoices for test project, all correctly filtered: {all_from_project}")
        else:
            self.log_test("Filter by project", False, f"- {project_invoices}")

        # Test filter by status
        success, draft_invoices = self.make_request('GET', 'invoices?status=draft')
        if success:
            draft_count = len(draft_invoices)
            all_are_draft = all(inv.get('status') == 'draft' for inv in draft_invoices)
            self.log_test("Filter by status (draft)", all_are_draft,
                        f"- Found {draft_count} draft invoices, all correctly filtered: {all_are_draft}")
        else:
            self.log_test("Filter by status (draft)", False, f"- {draft_invoices}")

        # Test combined filters
        success, combined_results = self.make_request('GET', f'invoices?type=tax_invoice&project_id={self.test_project_id}&status=draft')
        if success:
            combined_count = len(combined_results)
            meets_all_criteria = all(
                inv.get('invoice_type') == 'tax_invoice' and 
                inv.get('project_id') == self.test_project_id and 
                inv.get('status') == 'draft'
                for inv in combined_results
            )
            self.log_test("Combined filters", meets_all_criteria,
                        f"- Found {combined_count} invoices meeting all criteria: {meets_all_criteria}")
        else:
            self.log_test("Combined filters", False, f"- {combined_results}")

        return True

    def test_ra_logic_separation(self):
        """Test 4: RA Logic Separation - verify RA numbers only for tax invoices"""
        print("\n🔢 Testing RA Logic Separation...")
        
        # Get all invoices and analyze RA numbering
        success, all_invoices = self.make_request('GET', 'invoices')
        if not success:
            self.log_test("Get invoices for RA analysis", False, f"- {all_invoices}")
            return False

        # Separate invoices by type
        tax_invoices = [inv for inv in all_invoices if inv.get('invoice_type') == 'tax_invoice']
        proforma_invoices = [inv for inv in all_invoices if inv.get('invoice_type') == 'proforma']
        
        self.log_test("Invoice type separation", True, 
                    f"- Tax invoices: {len(tax_invoices)}, Proforma invoices: {len(proforma_invoices)}")

        # Check RA numbering for tax invoices
        tax_with_ra = []
        tax_without_ra = []
        
        for inv in tax_invoices:
            ra_number = inv.get('ra_number', '')
            if ra_number and ra_number.startswith('RA'):
                tax_with_ra.append(inv)
            else:
                tax_without_ra.append(inv)

        tax_ra_correct = len(tax_without_ra) == 0  # All tax invoices should have RA numbers
        self.log_test("Tax invoices have RA numbers", tax_ra_correct,
                    f"- With RA: {len(tax_with_ra)}, Without RA: {len(tax_without_ra)}")

        # Check RA numbering for proforma invoices
        proforma_with_ra = []
        proforma_without_ra = []
        
        for inv in proforma_invoices:
            ra_number = inv.get('ra_number', '')
            if ra_number and ra_number.startswith('RA'):
                proforma_with_ra.append(inv)
            else:
                proforma_without_ra.append(inv)

        proforma_ra_correct = len(proforma_with_ra) == 0  # No proforma invoices should have RA numbers
        self.log_test("Proforma invoices have NO RA numbers", proforma_ra_correct,
                    f"- With RA: {len(proforma_with_ra)}, Without RA: {len(proforma_without_ra)}")

        # Check RA number sequence for tax invoices
        ra_numbers = []
        for inv in tax_with_ra:
            ra_number = inv.get('ra_number', '')
            if ra_number.startswith('RA'):
                try:
                    ra_num = int(ra_number[2:])  # Extract number after 'RA'
                    ra_numbers.append(ra_num)
                except ValueError:
                    pass

        ra_numbers.sort()
        sequence_correct = True
        if len(ra_numbers) > 1:
            for i in range(1, len(ra_numbers)):
                if ra_numbers[i] != ra_numbers[i-1] + 1:
                    sequence_correct = False
                    break

        self.log_test("RA number sequence", sequence_correct,
                    f"- RA numbers: {ra_numbers}, Sequential: {sequence_correct}")

        # Verify invoice count and totals are calculated separately
        success, project_details = self.make_request('GET', f'projects/{self.test_project_id}/details')
        if success:
            project_invoices = project_details.get('invoices', [])
            project_tax_invoices = [inv for inv in project_invoices if inv.get('invoice_type') == 'tax_invoice']
            project_proforma_invoices = [inv for inv in project_invoices if inv.get('invoice_type') == 'proforma']
            
            # Calculate totals separately
            tax_total = sum(inv.get('total_amount', 0) for inv in project_tax_invoices)
            proforma_total = sum(inv.get('total_amount', 0) for inv in project_proforma_invoices)
            
            separate_calculation = tax_total != proforma_total or len(project_tax_invoices) != len(project_proforma_invoices)
            self.log_test("Separate invoice calculations", separate_calculation,
                        f"- Tax total: ₹{tax_total} ({len(project_tax_invoices)} invoices), Proforma total: ₹{proforma_total} ({len(project_proforma_invoices)} invoices)")
        else:
            self.log_test("Get project for calculation check", False, f"- {project_details}")

        return tax_ra_correct and proforma_ra_correct and sequence_correct

    def test_invoice_creation_workflow(self):
        """Test complete invoice creation workflow and data consistency"""
        print("\n🔄 Testing Complete Invoice Creation Workflow...")
        
        # Create another tax invoice to test RA sequence
        workflow_invoice_data = {
            "project_id": self.test_project_id,
            "project_name": "Invoice Sync Test Project",
            "client_id": self.test_client_id,
            "client_name": "Sync Test Client Ltd",
            "invoice_type": "tax_invoice",
            "items": [
                {
                    "boq_item_id": "3",
                    "serial_number": "3",
                    "description": "Steel Reinforcement TMT Bars - Second Bill",
                    "unit": "Kg",
                    "quantity": 500,  # Partial quantity
                    "rate": 65,
                    "amount": 32500,
                    "gst_rate": 18.0,
                    "gst_amount": 5850,
                    "total_with_gst": 38350
                }
            ],
            "subtotal": 32500,
            "total_gst_amount": 5850,
            "total_amount": 38350,
            "status": "draft",
            "include_tax": True,
            "payment_terms": "15 days from invoice date",
            "advance_received": 5000,
            "created_by": self.user_data['id']
        }
        
        success, workflow_result = self.make_request('POST', 'invoices', workflow_invoice_data)
        if success and 'invoice_id' in workflow_result:
            workflow_invoice_id = workflow_result['invoice_id']
            self.created_invoices.append(workflow_invoice_id)
            self.log_test("Create workflow test invoice", True, f"- Invoice ID: {workflow_invoice_id}")
            
            # Verify immediate project refresh
            success, refreshed_project = self.make_request('GET', f'projects/{self.test_project_id}/details')
            if success:
                refreshed_invoices = refreshed_project.get('invoices', [])
                workflow_invoice_found = any(inv.get('id') == workflow_invoice_id for inv in refreshed_invoices)
                self.log_test("Immediate project refresh", workflow_invoice_found,
                            f"- New invoice appears in project view immediately")
                
                # Check financial summary update
                financial = refreshed_project.get('financial_summary', {})
                updated_total = financial.get('total_invoiced', 0)
                updated_count = financial.get('total_invoices', 0)
                
                self.log_test("Financial summary update", updated_total > 0 and updated_count >= len(self.created_invoices),
                            f"- Updated total: ₹{updated_total}, Count: {updated_count}")
            else:
                self.log_test("Get refreshed project", False, f"- {refreshed_project}")
                
        else:
            self.log_test("Create workflow test invoice", False, f"- {workflow_result}")
            return False

        return True

    def run_sync_tests(self):
        """Run all sync-related tests"""
        print("🚀 Starting Invoice Sync Testing for Activus Invoice Management System")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Setup test data
        if not self.setup_test_data():
            print("\n❌ Test setup failed - stopping tests")
            return False
        
        # Run sync tests
        test_results = []
        
        test_results.append(self.test_invoice_data_synchronization())
        test_results.append(self.test_project_details_refresh())
        test_results.append(self.test_search_and_filter_functionality())
        test_results.append(self.test_ra_logic_separation())
        test_results.append(self.test_invoice_creation_workflow())
        
        # Print summary
        print("\n" + "=" * 80)
        print(f"📊 Sync Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"🧾 Created {len(self.created_invoices)} test invoices")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        # Detailed results
        all_passed = all(test_results)
        if all_passed:
            print("🎉 All critical sync functionality is working correctly!")
        else:
            print("⚠️  Some sync issues detected - see details above")
        
        return all_passed

def main():
    """Main test execution"""
    tester = InvoiceSyncTester()
    
    try:
        success = tester.run_sync_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())