#!/usr/bin/env python3
"""
Simple script to demonstrate pytest benefits vs manual testing.
"""

import subprocess
import sys
import os

def run_pytest():
    """Run pytest and show the benefits."""
    print("🚀 Running pytest tests...")
    print("=" * 50)
    
    try:
        # Run pytest with verbose output
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/", 
            "-v", 
            "--tb=short"
        ], capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        print(f"\nExit code: {result.returncode}")
        
        if result.returncode == 0:
            print("✅ All tests passed!")
        else:
            print("❌ Some tests failed!")
            
    except FileNotFoundError:
        print("❌ pytest not found. Install it with: pip install pytest pytest-flask")
    except Exception as e:
        print(f"❌ Error running tests: {e}")

def compare_approaches():
    """Compare manual testing vs pytest approach."""
    print("\n📊 Comparison: Manual Scripts vs pytest")
    print("=" * 50)
    
    comparison = """
    🔴 MANUAL SCRIPT APPROACH (your current test_translation_endpoints.py):
    ❌ Tests can interfere with each other
    ❌ Same setup code repeated everywhere  
    ❌ Poor error messages when tests fail
    ❌ Must run each test manually
    ❌ No code coverage information
    ❌ Hard to maintain and extend
    ❌ No parallel execution
    ❌ Difficult to debug failures
    
    🟢 PYTEST APPROACH (what we just set up):
    ✅ Each test runs in isolation with fresh database
    ✅ Reusable fixtures eliminate code duplication
    ✅ Clear, descriptive error messages
    ✅ Automatic test discovery and execution
    ✅ Built-in coverage reporting
    ✅ Easy to maintain and extend
    ✅ Can run tests in parallel
    ✅ Interactive debugging with pdb
    ✅ Works with CI/CD pipelines
    ✅ Professional testing standards
    """
    
    print(comparison)

def show_usage():
    """Show how to use the new testing approach."""
    print("\n📖 How to Use the New Testing Approach")
    print("=" * 50)
    
    usage = """
    # Install dependencies
    pip install pytest pytest-flask pytest-cov factory-boy
    
    # Run all tests
    pytest
    
    # Run specific test file
    pytest tests/test_basic.py
    
    # Run with coverage
    pytest --cov=my_app --cov-report=html
    
    # Run only fast tests
    pytest -m "not slow"
    
    # Run tests in parallel
    pytest -n auto
    
    # Debug a failing test
    pytest tests/test_basic.py::TestAuthentication::test_login_success -s --pdb
    """
    
    print(usage)

if __name__ == "__main__":
    print("🧪 Sounglah Testing Demo")
    print("=" * 50)
    
    # Show comparison first
    compare_approaches()
    
    # Show usage
    show_usage()
    
    # Ask if user wants to run tests
    try:
        response = input("\n🤔 Would you like to run the pytest tests? (y/n): ")
        if response.lower() in ['y', 'yes']:
            run_pytest()
        else:
            print("👋 No problem! You can run tests later with: pytest")
    except KeyboardInterrupt:
        print("\n👋 Goodbye!") 