from playwright.sync_api import sync_playwright, Page, expect

def login(page: Page, username, password):
    page.goto("http://localhost:5000/auth")
    page.get_by_label("Username").fill(username)
    page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Sign in").click()
    page.wait_for_timeout(1000) # wait for potential error message
    print(page.content())
    expect(page).to_have_url("http://localhost:5000/")

def logout(page: Page):
    page.get_by_role("button", name="Log Out").click()
    expect(page).to_have_url("http://localhost:5000/auth")

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Manager verification
        login(page, "manager", "password")
        page.wait_for_selector("text=Admin & Manager Dashboard")
        page.screenshot(path="jules-scratch/verification/manager_dashboard.png")
        logout(page)

        # Employee verification
        login(page, "employee", "password")
        page.wait_for_selector("text=Employee Dashboard")
        page.screenshot(path="jules-scratch/verification/employee_dashboard.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
