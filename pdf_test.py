#!/usr/bin/env python3
"""
Focused PDF Generation Testing for Invoice Management System
Tests the specific PDF generation and download functionality
"""

import requests
import sys
import json
from datetime import datetime

class PDFTester:
    def __init__(self, base_url="https://0de79f73-880e-4b75-b873-cf862a9b62ec.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        if success:
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
        """Login to get authentication token"""
        print("🔐 Authenticating...")
        
        success, result = self.make_request('POST', 'auth/login', 
                                          {'email': 'brightboxm@gmail.com', 'password': 'admin123'})
        
        if success and 'access_token' in result:
            self.token = result['access_token']
            self.user_data = result['user']
            self.log_test("Authentication", True, f"- Role: {self.user_data['role']}")
            return True
        else:
            self.log_test("Authentication", False, f"- {result}")
            return False

    def get_existing_invoices(self):
        """Get list of existing invoices to test PDF generation"""
        print("\n📋 Getting existing invoices...")
        
        success, result = self.make_request('GET', 'invoices')
        
        if success and result:
            self.log_test("Get invoices", True, f"- Found {len(result)} invoices")
            
            # Print invoice details for debugging
            for i, invoice in enumerate(result[:3]):  # Show first 3 invoices
                print(f"   Invoice {i+1}: ID={invoice.get('id', 'N/A')}, Number={invoice.get('invoice_number', 'N/A')}, Project={invoice.get('project_name', 'N/A')}")
            
            return result
        else:
            self.log_test("Get invoices", False, f"- {result}")
            return []

    def test_pdf_generation_for_invoice(self, invoice_id, invoice_number="Unknown"):
        """Test PDF generation for a specific invoice"""
        print(f"\n📄 Testing PDF generation for invoice {invoice_number} (ID: {invoice_id})...")
        
        # First, let's check if the invoice exists and get its details
        success, invoice_data = self.make_request('GET', f'invoices/{invoice_id}', expected_status=404)
        if not success:
            # Try to get invoice from the list instead
            invoices = self.get_existing_invoices()
            invoice_data = next((inv for inv in invoices if inv['id'] == invoice_id), None)
            if invoice_data:
                print(f"   Found invoice in list: {invoice_data.get('invoice_number', 'N/A')}")
            else:
                self.log_test(f"Invoice {invoice_number} exists", False, "- Invoice not found")
                return False

        # Test PDF generation
        success, pdf_result = self.make_request('GET', f'invoices/{invoice_id}/pdf')
        
        if success:
            if isinstance(pdf_result, bytes):
                pdf_size = len(pdf_result)
                self.log_test(f"PDF generation for {invoice_number}", True, f"- PDF size: {pdf_size} bytes")
                
                # Check if it's a valid PDF (starts with %PDF)
                if pdf_result.startswith(b'%PDF'):
                    self.log_test(f"PDF format validation for {invoice_number}", True, "- Valid PDF format")
                else:
                    self.log_test(f"PDF format validation for {invoice_number}", False, "- Invalid PDF format")
                
                return True
            else:
                self.log_test(f"PDF generation for {invoice_number}", False, "- Response is not binary data")
                return False
        else:
            self.log_test(f"PDF generation for {invoice_number}", False, f"- {pdf_result}")
            
            # Let's check what related data might be missing
            self.diagnose_pdf_generation_issue(invoice_id, invoice_data if 'invoice_data' in locals() else None)
            return False

    def diagnose_pdf_generation_issue(self, invoice_id, invoice_data=None):
        """Diagnose why PDF generation might be failing"""
        print(f"\n🔍 Diagnosing PDF generation issue for invoice {invoice_id}...")
        
        if not invoice_data:
            # Try to get invoice data from the invoices list
            invoices = self.get_existing_invoices()
            invoice_data = next((inv for inv in invoices if inv['id'] == invoice_id), None)
        
        if not invoice_data:
            print("   ❌ Cannot diagnose - invoice data not available")
            return
        
        # Check required fields for PDF generation
        required_fields = ['project_id', 'client_id', 'items']
        missing_fields = []
        
        for field in required_fields:
            if field not in invoice_data or not invoice_data[field]:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"   ❌ Missing required fields: {missing_fields}")
        else:
            print("   ✅ All required invoice fields present")
        
        # Check if related project exists
        project_id = invoice_data.get('project_id')
        if project_id:
            success, project_data = self.make_request('GET', f'projects/{project_id}', expected_status=404)
            if success:
                print(f"   ✅ Related project found: {project_data.get('project_name', 'N/A')}")
            else:
                print(f"   ❌ Related project not found: {project_id}")
        
        # Check if related client exists
        client_id = invoice_data.get('client_id')
        if client_id:
            success, clients = self.make_request('GET', 'clients')
            if success:
                client_data = next((c for c in clients if c['id'] == client_id), None)
                if client_data:
                    print(f"   ✅ Related client found: {client_data.get('name', 'N/A')}")
                else:
                    print(f"   ❌ Related client not found: {client_id}")
            else:
                print("   ❌ Cannot check clients")
        
        # Check invoice items structure
        items = invoice_data.get('items', [])
        if items:
            print(f"   ✅ Invoice has {len(items)} items")
            # Check first item structure
            first_item = items[0]
            required_item_fields = ['description', 'quantity', 'rate', 'amount']
            missing_item_fields = [f for f in required_item_fields if f not in first_item]
            if missing_item_fields:
                print(f"   ❌ First item missing fields: {missing_item_fields}")
            else:
                print("   ✅ Invoice items have required fields")
        else:
            print("   ❌ Invoice has no items")

    def test_pdf_generation_comprehensive(self):
        """Comprehensive PDF generation testing"""
        print("\n🎯 Comprehensive PDF Generation Testing")
        print("=" * 60)
        
        # Get existing invoices
        invoices = self.get_existing_invoices()
        
        if not invoices:
            print("❌ No invoices found to test PDF generation")
            return False
        
        # Test PDF generation for first few invoices
        success_count = 0
        total_tested = 0
        
        for invoice in invoices[:5]:  # Test first 5 invoices
            invoice_id = invoice.get('id')
            invoice_number = invoice.get('invoice_number', 'Unknown')
            
            if invoice_id:
                total_tested += 1
                if self.test_pdf_generation_for_invoice(invoice_id, invoice_number):
                    success_count += 1
        
        print(f"\n📊 PDF Generation Test Summary:")
        print(f"   Total tested: {total_tested}")
        print(f"   Successful: {success_count}")
        print(f"   Failed: {total_tested - success_count}")
        print(f"   Success rate: {(success_count/total_tested*100):.1f}%" if total_tested > 0 else "N/A")
        
        return success_count > 0

    def run_pdf_tests(self):
        """Run all PDF-related tests"""
        print("🚀 Starting PDF Generation Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            print("\n❌ Authentication failed - stopping tests")
            return False
        
        # Run comprehensive PDF tests
        success = self.test_pdf_generation_comprehensive()
        
        print("\n" + "=" * 80)
        if success:
            print("✅ PDF generation tests completed with some successes")
        else:
            print("❌ PDF generation tests failed completely")
        
        return success

def main():
    """Main test execution"""
    tester = PDFTester()
    
    try:
        success = tester.run_pdf_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())