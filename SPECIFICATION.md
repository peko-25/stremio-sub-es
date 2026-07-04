\# Design and Visual Specification



\## Overall Style



The website should feel like a modern, high-quality technology project built by someone passionate about software. The aesthetic should combine a futuristic cyber style with a professional and polished appearance.



The visual inspiration should resemble modern developer tools, dashboards, cybersecurity interfaces, or open-source project websites, with a subtle "dark web" atmosphere only in terms of color palette, lighting, and visual details. It should \*\*never\*\* feel suspicious, cluttered, or difficult to navigate.



The interface should feel fast, lightweight, and premium.



\---



\## Color Palette



Use a fully dark theme.



Primary background:



\* Between #09090B and #10121A.



Secondary surfaces:



\* Very dark blue with subtle purple tones.



Accent colors:



\* Electric purple.

\* Bright blue.

\* Soft cyan for small highlights only.



Avoid:



\* Bright yellow.

\* Strong red.

\* Bright green.

\* Pure black (#000000).

\* Pure white for large amounts of text.



Body text should use a slightly off-white color to reduce eye strain.



\---



\## Typography



Use a modern, clean, highly readable font.



Preferred fonts (in order):



\* Inter

\* Manrope

\* Outfit

\* Space Grotesk



If external fonts cannot be used, fall back to:



Inter, "Segoe UI", Arial, sans-serif



Headings should use a weight between 700–800.



Body text should use 400–500.



Avoid "hacker" style fonts that reduce readability.



\---



\## Background



The background should never look completely flat.



Create subtle visual depth using only CSS:



\* Soft radial gradients.

\* Very subtle purple and blue glow.

\* Gentle lighting effects.

\* Optional extremely subtle noise texture.

\* Very faint geometric patterns or lines.



Do not use background images.



\---



\## Cards



Cards should be one of the main visual elements.



Characteristics:



\* Border radius between 14px and 18px.

\* Slightly lighter than the page background.

\* Thin semi-transparent border.

\* Soft shadow.

\* Subtle lighting effect on hover.



Hover behavior:



\* Slightly increase brightness.

\* Lift the card by approximately 2–4px.

\* Smooth transition.



\---



\## Buttons



All buttons must have rounded corners.



Characteristics:



\* Comfortable height.

\* Generous padding.

\* Blue/Purple accent colors.

\* Smooth transition (\~200ms).



Hover:



\* Slight brightness increase.

\* Small elevation.

\* Soft glowing shadow.



Active state:



\* Scale down to about 98%.

\* Remove the elevation.



Never use square buttons.



\---



\## Animations



Animations should be subtle and polished.



Recommended effects:



\* Fade-in when the page loads.

\* Smooth section reveal animations.

\* Elegant hover transitions.

\* Gentle glowing effects.

\* Small movement (4–8px).



Avoid:



\* Bounce animations.

\* Rotations.

\* Flashy effects.

\* Particle systems.

\* Anything distracting.



Every animation should feel smooth and intentional.



\---



\## Icons



Prefer SVG icons.



All icons should share the same visual style.



Do not mix icon styles.



Icons should use the primary accent colors.



\---



\## Responsive Design



The page must work perfectly on:



\* Desktop

\* Tablet

\* Mobile



On mobile:



\* Reduce margins appropriately.

\* Maintain generous spacing.

\* Make buttons easy to tap.

\* Never allow horizontal scrolling.



\---



\## Visual Hierarchy



The layout should naturally guide the user through the page.



The user should immediately understand:



1\. What the addon is.

2\. What it does.

3\. How to install it.

4\. How to download it.

5\. Additional information.



Each section should feel visually distinct while remaining part of a cohesive design.



\---



\## Visual Details



Include subtle details that make the page feel alive:



\* Soft glowing borders.

\* Gentle reflections.

\* Small decorative lines.

\* Gradient dividers.

\* Soft shadows.



Never overuse visual effects.



\---



\## Accessibility



Maintain excellent contrast between text and background.



Buttons should always be clearly recognizable.



Interactive elements must provide hover and focus states.



\---



\## Performance



Do not use frameworks.



Do not use Bootstrap.



Do not use Tailwind CSS.



Do not use React.



Do not use Vue.



Do not use Angular.



Do not use any external dependencies.



The page should be built only with:



\* HTML

\* CSS

\* Vanilla JavaScript (only if necessary)



Everything should remain lightweight and fast.



\---



\## Code Quality



The HTML should be properly indented and semantic.



Organize the CSS into clearly commented sections.



Use descriptive and consistent class names.



Avoid duplicated styles.



Write clean, maintainable code.



\---



\## Suggested Sections



The page should include professional-looking sections such as:



\* A hero section displaying the addon name.

\* A short highlighted description.

\* A primary download card.

\* A features section with icons.

\* A step-by-step installation guide.

\* A FAQ section.

\* A compatibility or important notes section.

\* A simple footer with project information.



\---



\## Browser Title



The `<title>` element should contain \*\*only the addon's name\*\*, without extra text such as "Home", "Official Website", or "Download", so the browser tab remains clean and professional.



\---



\## Overall Feeling



When visitors open the page, it should immediately feel like the official website of a well-maintained software project. The design should communicate professionalism, trust, and technical quality through a modern futuristic interface built around dark blue and purple tones. It should look visually impressive without sacrificing usability, readability, accessibility, or performance.



