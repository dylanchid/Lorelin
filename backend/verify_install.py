try:
    import browserbase
    import anthropic
    with open("install_check.txt", "w") as f:
        f.write("Success: Modules found")
except ImportError as e:
    with open("install_check.txt", "w") as f:
        f.write(f"Error: {e}")
