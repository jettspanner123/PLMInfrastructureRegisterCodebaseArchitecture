# PRD: 9/10/2026

## Objective
We need to add few features to existing page "Environment Overview" in this app, as well as fine tuning some other features
so that the user experience is improved and the app is more intuitive to use. Adding a new "Settings" page is also part of this PRD. Details are below.

## Core Features
- You need to add a new page called "Settings" in the app. This page will have a few settings that the user can change.
- The link to this new "Settings" page will be in the "Profile Dropdown" instead of the "Configure Subscription" link. The "Configure Subscriptions" link will be removed from the "Profile Dropdown" and the new "Settings" link will be added in its place with exactly the same style but with different icon and text.
- In this settions plage, there will be a "sidebar" like the one in the "Assetsphere", please study how that sidebar is made in the "Assetsphere" and like that it should be 1:1 copy of it, in the "Settings" page please.
- For now the only 2 options in the "Sidebar" will be:
	- "Subscriptions", in which the current "Configure Subscriptions" page will be shown.
	- "Editing", in which the user will be able to see all the colors that are added, will be able:
		- Add new colors.
		- Remove existing colors.
		- Rename existing colors.
		- Change the color of existing colors.
		- Everything should be persisted in the database via backend.

## Side Features
- In the "Environment Overview" page, we need to add a new dropdown with the name of "Columns" like we already have in the "Infrastructure Register" page, in this page there is a columns dropdown which allows the user to select which columns they want to see in the table. We need to add this same functionality to the "Environment Overview" page. Just make sure the options in the dropdown are for the table in the "Environment Overview" page and not for the table in the "Infrastructure Register" page.
- Currenlty when we click on the "Add Environment" button, it scrolls down to the bottom of the table where a new entry is added to the table. You need to do something so that, that scroll is not instant jump, but a smooth scroll to the bottom of the table please.

## Testing
- Make sure to test the new dropdown functionality in the "Environment Overview" page and ensure that it works as expected.
- Make sure to test the smooth scroll functionality when clicking on the "Add Environment" button and ensure that it works as expected.		