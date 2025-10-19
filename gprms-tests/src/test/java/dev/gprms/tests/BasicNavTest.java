package dev.gprms.tests;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

/**
 * Unit test for simple App.
 */
public class BasicNavTest {
    private WebDriver driver;
    private final String TARGET_URL = "https://theshawa-dev.web.app";

    @BeforeEach
    public void setup() {
        // Initializes the Chrome WebDriver.
        // Selenium Manager (in recent Selenium versions) automatically handles
        // downloading and setting up the ChromeDriver executable.
        driver = new ChromeDriver();
        // Set a reasonable implicit wait time
        driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(10));
    }

    @AfterEach
    public void teardown() {
        // Closes the browser and ends the WebDriver session
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testGoogleHomePageTitle() {
        // 1. Navigate to the target URL
        driver.get(TARGET_URL);

        String pageTitle = driver.getTitle();
        System.out.println("Page Title after search: " + pageTitle);
        assertTrue(pageTitle.contains("Theshawa"), "The page title does not contain the term 'Theshawa'.");
    }
}
