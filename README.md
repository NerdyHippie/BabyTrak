# BabyTrak
Firebase-driven app to track progress of a new baby.  Mostly a learning experiment


## Ideas
- Prevent anything from appearing unless user is logged in
- Have CF create/update a firebase object to show who is logged in and possibly what they are doing (will need to test CF onSessionEnd as a way of removing user info from Firebase)
- Create a reusable modal directive that can become part of the NH library
- Create a reusable List/Detail/Edit panel display that can become part of the NH library
	- Options for animation style: fades, swooshing panels, etc.
	- Transcludes contents (may require multiple directives i.e. ldeDisplay, listView, detailView, editView)