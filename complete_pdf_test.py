#!/usr/bin/env python3
"""
Complete PDF Generation Test - Creates proper invoice and tests PDF generation
"""

import requests
import sys
import json
from datetime import datetime

class CompletePDFTester:
    def __init__(self, base_url="https://0de79f73-880e-4b75-b873-cf862a9b62ec.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.created_resources = {
            'clients': [],
            'projects': [],
            'invoices': []
        }

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

    def create_test_client(self):
        """Create a test client for PDF testing"""
        print("\n👥 Creating test client...")
        
        client_data = {
            "name": "PDF Test Client Ltd",
            "gst_no": "27PDFTEST1234F1Z5",
            "bill_to_address": "123 PDF Test Street, Test City, Test State - 123456",
            "ship_to_address": "456 Ship Street, Ship City, Ship State - 654321",
            "contact_person": "PDF Test Manager",
            "phone": "+91-9876543210",
            "email": "pdf@testclient.com"
        }
        
        success, result = self.make_request('POST', 'clients', client_data)
        
        if success and 'client_id' in result:
            client_id = result['client_id']
            self.created_resources['clients'].append(client_id)
            self.log_test("Create test client", True, f"- Client ID: {client_id}")
            return client_id
        else:
            self.log_test("Create test client", False, f"- {result}")
            return None

    def create_test_project(self, client_id):
        """Create a test project for PDF testing"""
        print("\n🏗️ Creating test project...")
        
        project_data = {
            "project_name": "PDF Test Construction Project",
            "architect": "PDF Test Architect",
            "client_id": client_id,
            "client_name": "PDF Test Client Ltd",
            "metadata": {
                "project_name": "PDF Test Construction Project",
                "architect": "PDF Test Architect",
                "client": "PDF Test Client Ltd",
                "location": "PDF Test Location"
            },
            "boq_items": [
                {
                    "serial_number": "1",
                    "description": "PDF Test Excavation Work",
                    "unit": "Cum",
                    "quantity": 100,
                    "rate": 150,
                    "amount": 15000,
                    "category": "Earthwork",
                    "billed_quantity": 0.0,
                    "gst_rate": 18.0,
                    "is_gst_locked": False
                },
                {
                    "serial_number": "2",
                    "description": "PDF Test Concrete Work",
                    "unit": "Cum",
                    "quantity": 50,
                    "rate": 4500,
                    "amount": 225000,
                    "category": "Concrete",
                    "billed_quantity": 0.0,
                    "gst_rate": 18.0,
                    "is_gst_locked": False
                }
            ],
            "total_project_value": 240000,
            "advance_received": 50000,
            "created_by": self.user_data['id']
        }
        
        success, result = self.make_request('POST', 'projects', project_data)
        
        if success and 'project_id' in result:
            project_id = result['project_id']
            self.created_resources['projects'].append(project_id)
            self.log_test("Create test project", True, f"- Project ID: {project_id}")
            return project_id
        else:
            self.log_test("Create test project", False, f"- {result}")
            return None

    def create_test_invoice(self, project_id, client_id):
        """Create a test invoice with all required fields for PDF generation"""
        print("\n🧾 Creating test invoice...")
        
        invoice_data = {
            "project_id": project_id,
            "project_name": "PDF Test Construction Project",
            "client_id": client_id,
            "client_name": "PDF Test Client Ltd",
            "invoice_type": "proforma",
            "items": [
                {
                    "boq_item_id": "1",  # Required field
                    "serial_number": "1",
                    "description": "PDF Test Excavation Work (Partial)",
                    "unit": "Cum",
                    "quantity": 50,  # Partial quantity
                    "rate": 150,
                    "amount": 7500,
                    "gst_rate": 18.0,
                    "gst_amount": 1350,
                    "total_with_gst": 8850
                },
                {
                    "boq_item_id": "2",  # Required field
                    "serial_number": "2",
                    "description": "PDF Test Concrete Work (Partial)",
                    "unit": "Cum",
                    "quantity": 25,  # Partial quantity
                    "rate": 4500,
                    "amount": 112500,
                    "gst_rate": 18.0,
                    "gst_amount": 20250,
                    "total_with_gst": 132750
                }
            ],
            "subtotal": 120000,
            "total_gst_amount": 21600,
            "total_amount": 141600,
            "status": "draft",
            "created_by": self.user_data['id']
        }
        
        success, result = self.make_request('POST', 'invoices', invoice_data)
        
        if success and 'invoice_id' in result:
            invoice_id = result['invoice_id']
            self.created_resources['invoices'].append(invoice_id)
            self.log_test("Create test invoice", True, f"- Invoice ID: {invoice_id}, RA: {result.get('ra_number', 'N/A')}")
            return invoice_id
        else:
            self.log_test("Create test invoice", False, f"- {result}")
            return None

    def test_pdf_generation(self, invoice_id):
        """Test PDF generation for the created invoice"""
        print(f"\n📄 Testing PDF generation for invoice {invoice_id}...")
        
        success, pdf_result = self.make_request('GET', f'invoices/{invoice_id}/pdf')
        
        if success:
            if isinstance(pdf_result, bytes):
                pdf_size = len(pdf_result)
                self.log_test("PDF generation", True, f"- PDF size: {pdf_size} bytes")
                
                # Check if it's a valid PDF (starts with %PDF)
                if pdf_result.startswith(b'%PDF'):
                    self.log_test("PDF format validation", True, "- Valid PDF format")
                    
                    # Save PDF for manual inspection (optional)
                    try:
                        with open('/app/test_invoice.pdf', 'wb') as f:
                            f.write(pdf_result)
                        self.log_test("PDF file saved", True, "- Saved as /app/test_invoice.pdf")
                    except Exception as e:
                        print(f"   ⚠️ Could not save PDF file: {e}")
                    
                    return True
                else:
                    self.log_test("PDF format validation", False, "- Invalid PDF format")
                    return False
            else:
                self.log_test("PDF generation", False, "- Response is not binary data")
                return False
        else:
            self.log_test("PDF generation", False, f"- {pdf_result}")
            return False

    def test_existing_invoices_pdf(self):
        """Test PDF generation for existing invoices that should work"""
        print("\n📋 Testing existing invoices...")
        
        success, invoices = self.make_request('GET', 'invoices')
        
        if not success:
            self.log_test("Get existing invoices", False, f"- {invoices}")
            return False
        
        working_invoices = []
        for invoice in invoices:
            # Check if invoice has required fields
            if (invoice.get('project_id') and 
                invoice.get('client_id') and 
                invoice.get('items') and 
                len(invoice.get('items', [])) > 0):
                working_invoices.append(invoice)
        
        self.log_test("Find working invoices", True, f"- Found {len(working_invoices)} invoices with complete data")
        
        # Test PDF generation for working invoices
        success_count = 0
        for invoice in working_invoices[:3]:  # Test first 3 working invoices
            invoice_id = invoice.get('id')
            invoice_number = invoice.get('invoice_number', 'Unknown')
            
            success, pdf_result = self.make_request('GET', f'invoices/{invoice_id}/pdf')
            
            if success and isinstance(pdf_result, bytes) and pdf_result.startswith(b'%PDF'):
                success_count += 1
                self.log_test(f"PDF for {invoice_number}", True, f"- Size: {len(pdf_result)} bytes")
            else:
                self.log_test(f"PDF for {invoice_number}", False, f"- Failed")
        
        return success_count > 0

    def run_complete_pdf_test(self):
        """Run complete PDF generation test"""
        print("🚀 Starting Complete PDF Generation Test")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            print("\n❌ Authentication failed - stopping tests")
            return False
        
        # Test existing invoices first
        existing_success = self.test_existing_invoices_pdf()
        
        # Create complete test data and test PDF generation
        client_id = self.create_test_client()
        if not client_id:
            print("\n❌ Failed to create test client - stopping tests")
            return False
        
        project_id = self.create_test_project(client_id)
        if not project_id:
            print("\n❌ Failed to create test project - stopping tests")
            return False
        
        invoice_id = self.create_test_invoice(project_id, client_id)
        if not invoice_id:
            print("\n❌ Failed to create test invoice - stopping tests")
            return False
        
        # Test PDF generation
        pdf_success = self.test_pdf_generation(invoice_id)
        
        print("\n" + "=" * 80)
        print("📊 Complete PDF Test Summary:")
        print(f"   Existing invoices PDF test: {'✅ PASSED' if existing_success else '❌ FAILED'}")
        print(f"   New invoice PDF test: {'✅ PASSED' if pdf_success else '❌ FAILED'}")
        
        overall_success = existing_success or pdf_success
        print(f"   Overall result: {'✅ PDF GENERATION WORKING' if overall_success else '❌ PDF GENERATION BROKEN'}")
        
        if self.created_resources['clients']:
            print(f"   Created {len(self.created_resources['clients'])} test clients")
        if self.created_resources['projects']:
            print(f"   Created {len(self.created_resources['projects'])} test projects")
        if self.created_resources['invoices']:
            print(f"   Created {len(self.created_resources['invoices'])} test invoices")
        
        return overall_success

def main():
    """Main test execution"""
    tester = CompletePDFTester()
    
    try:
        success = tester.run_complete_pdf_test()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())