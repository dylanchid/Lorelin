import inspect
try:
    from browserbase import Browserbase
    print(inspect.signature(Browserbase.__init__))
except ImportError:
    print("Browserbase not installed")
except Exception as e:
    print(f"Error: {e}")
