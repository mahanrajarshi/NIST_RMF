import requests
import json
import sys
from datetime import datetime
import uuid

class NIST_AI_RMF_Tester:
    def __init__(self, base_url="https://rmf-assessor-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.assessment_id = None

    def log_result(self, test_name, success, details=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")
        
    def run_test(self, name, method, endpoint, expected_status=200, data=None):
        """Run a single API test"""
        url = f"{self.api_base}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            
            success = response.status_code == expected_status
            if success:
                try:
                    response_data = response.json()
                    self.log_result(name, True)
                    return True, response_data
                except json.JSONDecodeError:
                    self.log_result(name, False, "Invalid JSON response")
                    return False, {}
            else:
                self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}
                
        except requests.exceptions.Timeout:
            self.log_result(name, False, "Request timeout")
            return False, {}
        except requests.exceptions.RequestException as e:
            self.log_result(name, False, f"Request error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, data = self.run_test("API Root", "GET", "/")
        if success:
            return "message" in data
        return False

    def test_get_questions(self):
        """Test questions endpoint"""
        success, data = self.run_test("Get Questions", "GET", "/assessment/questions")
        if success:
            # Verify structure
            required_keys = ["functions", "questions", "maturity_levels", "total_questions"]
            if all(key in data for key in required_keys):
                # Verify 4 functions
                if len(data["functions"]) == 4:
                    # Verify 62 questions
                    if data["total_questions"] == 62 and len(data["questions"]) == 62:
                        # Verify function distribution 
                        func_counts = {}
                        for q in data["questions"]:
                            func = q["function"]
                            func_counts[func] = func_counts.get(func, 0) + 1
                        
                        expected_counts = {"govern": 17, "map": 16, "measure": 14, "manage": 15}
                        if func_counts == expected_counts:
                            self.log_result("Questions Structure Validation", True)
                            return data
                        else:
                            self.log_result("Questions Structure Validation", False, f"Wrong function distribution: {func_counts}")
                    else:
                        self.log_result("Questions Structure Validation", False, f"Expected 62 questions, got {len(data['questions'])}")
                else:
                    self.log_result("Questions Structure Validation", False, f"Expected 4 functions, got {len(data['functions'])}")
            else:
                missing = [k for k in required_keys if k not in data]
                self.log_result("Questions Structure Validation", False, f"Missing keys: {missing}")
        return False

    def test_get_industries(self):
        """Test industries endpoint"""
        success, data = self.run_test("Get Industries", "GET", "/assessment/industries")
        if success:
            if "industries" in data and len(data["industries"]) == 7:
                # Check required fields for each industry
                required_fields = ["id", "name", "code", "regulations", "description"]
                all_valid = True
                for industry in data["industries"]:
                    if not all(field in industry for field in required_fields):
                        all_valid = False
                        break
                
                if all_valid:
                    self.log_result("Industries Structure Validation", True)
                    return data["industries"]
                else:
                    self.log_result("Industries Structure Validation", False, "Missing required fields in industry data")
            else:
                self.log_result("Industries Structure Validation", False, f"Expected 7 industries, got {len(data.get('industries', []))}")
        return False

    def test_submit_assessment(self, questions_data):
        """Test assessment submission"""
        if not questions_data:
            self.log_result("Assessment Submission", False, "No questions data available")
            return False

        # Create sample assessment with all questions answered
        sample_answers = []
        for q in questions_data["questions"]:
            sample_answers.append({
                "question_id": q["id"],
                "score": 3  # Mid-level score
            })

        assessment_data = {
            "industry": "technology",
            "organization_name": f"Test_Org_{datetime.now().strftime('%H%M%S')}",
            "answers": sample_answers
        }

        success, data = self.run_test("Assessment Submission", "POST", "/assessment/submit", 200, assessment_data)
        if success:
            # Verify response structure
            required_keys = ["id", "industry", "organization_name", "overall_score", "overall_maturity", 
                           "function_scores", "category_scores", "radar_data", "priority_actions"]
            if all(key in data for key in required_keys):
                self.assessment_id = data["id"]
                
                # Validate data types and ranges
                if 0 <= data["overall_score"] <= 100:
                    if len(data["radar_data"]) == 4:  # Should have 4 functions
                        if isinstance(data["priority_actions"], list):
                            self.log_result("Assessment Response Validation", True)
                            return data
                        else:
                            self.log_result("Assessment Response Validation", False, "priority_actions is not a list")
                    else:
                        self.log_result("Assessment Response Validation", False, f"Expected 4 radar data points, got {len(data['radar_data'])}")
                else:
                    self.log_result("Assessment Response Validation", False, f"Invalid overall_score: {data['overall_score']}")
            else:
                missing = [k for k in required_keys if k not in data]
                self.log_result("Assessment Response Validation", False, f"Missing keys: {missing}")
        return False

    def test_get_assessment(self):
        """Test retrieving assessment by ID"""
        if not self.assessment_id:
            self.log_result("Get Assessment", False, "No assessment ID available")
            return False
            
        success, data = self.run_test("Get Assessment", "GET", f"/assessment/{self.assessment_id}")
        if success:
            # Verify it contains the same structure (minus answers)
            required_keys = ["id", "industry", "organization_name", "overall_score", "overall_maturity"]
            if all(key in data for key in required_keys):
                if data["id"] == self.assessment_id:
                    self.log_result("Assessment Retrieval Validation", True)
                    return data
                else:
                    self.log_result("Assessment Retrieval Validation", False, "Assessment ID mismatch")
            else:
                missing = [k for k in required_keys if k not in data]
                self.log_result("Assessment Retrieval Validation", False, f"Missing keys: {missing}")
        return False

    def test_get_recommendations(self):
        """Test industry recommendations endpoints"""
        industries = ["healthcare", "finance", "government", "defense", "technology", "energy", "education"]
        
        for industry in industries:
            success, data = self.run_test(f"Recommendations - {industry.title()}", "GET", f"/recommendations/{industry}")
            if success:
                required_keys = ["name", "code", "regulations", "description", "recommendations"]
                if all(key in data for key in required_keys):
                    if isinstance(data["recommendations"], list) and len(data["recommendations"]) > 0:
                        # Check first recommendation structure
                        first_rec = data["recommendations"][0]
                        rec_keys = ["function", "title", "description", "priority", "effort"]
                        if all(key in first_rec for key in rec_keys):
                            continue  # This industry passed
                        else:
                            self.log_result(f"Recommendations Structure - {industry}", False, "Missing keys in recommendation")
                            return False
                    else:
                        self.log_result(f"Recommendations Structure - {industry}", False, "No recommendations found")
                        return False
                else:
                    missing = [k for k in required_keys if k not in data]
                    self.log_result(f"Recommendations Structure - {industry}", False, f"Missing keys: {missing}")
                    return False
            else:
                return False
        
        self.log_result("All Recommendations Validation", True)
        return True

    def test_invalid_endpoints(self):
        """Test error handling for invalid requests"""
        # Test non-existent assessment
        success, _ = self.run_test("Invalid Assessment ID", "GET", "/assessment/invalid-id", 404)
        
        # Test non-existent industry
        success2, _ = self.run_test("Invalid Industry", "GET", "/recommendations/invalid-industry", 404)
        
        return success and success2

    def test_malformed_requests(self):
        """Test malformed assessment submission"""
        # Missing required fields
        invalid_data = {
            "industry": "technology"
            # Missing organization_name and answers
        }
        
        try:
            response = requests.post(f"{self.api_base}/assessment/submit", 
                                   json=invalid_data, 
                                   headers={'Content-Type': 'application/json'}, 
                                   timeout=10)
            # Should return 422 for validation error
            if response.status_code == 422:
                self.log_result("Malformed Request Handling", True)
                return True
            else:
                self.log_result("Malformed Request Handling", False, f"Expected 422, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Malformed Request Handling", False, f"Request error: {str(e)}")
            return False

def main():
    print("🔍 Starting NIST AI RMF Assessment API Testing...")
    print(f"📍 Target URL: https://rmf-assessor-pro.preview.emergentagent.com")
    print("=" * 60)
    
    tester = NIST_AI_RMF_Tester()
    
    # Test sequence
    print("\n1️⃣ Testing API Root...")
    tester.test_api_root()
    
    print("\n2️⃣ Testing Questions Endpoint...")
    questions_data = tester.test_get_questions()
    
    print("\n3️⃣ Testing Industries Endpoint...")
    industries_data = tester.test_get_industries()
    
    print("\n4️⃣ Testing Assessment Submission...")
    assessment_result = tester.test_submit_assessment(questions_data)
    
    print("\n5️⃣ Testing Assessment Retrieval...")
    tester.test_get_assessment()
    
    print("\n6️⃣ Testing Industry Recommendations...")
    tester.test_get_recommendations()
    
    print("\n7️⃣ Testing Error Handling...")
    tester.test_invalid_endpoints()
    
    print("\n8️⃣ Testing Input Validation...")
    tester.test_malformed_requests()
    
    # Results Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"✅ Tests Passed: {tester.tests_passed}")
    print(f"❌ Tests Failed: {len(tester.failed_tests)}")
    print(f"📈 Success Rate: {round((tester.tests_passed / tester.tests_run * 100), 1)}%")
    
    if tester.failed_tests:
        print("\n🚨 FAILED TESTS:")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"{i}. {failure['test']}: {failure['details']}")
    
    if tester.assessment_id:
        print(f"\n📋 Generated Assessment ID: {tester.assessment_id}")
    
    # Return exit code based on results
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())