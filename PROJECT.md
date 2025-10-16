I'm building a web app to manage a collection of "barillets", which are collections of themes for a match-style improv show in French, where two improv teams faces off in a series of on-the-spot stories based on a random selection of the themes.
Users of the web app are barillet authors, and can create new barillets or manage their past collection.

A barillet is composed of multiple themes, with each theme including

- A type ("Nature"), which can be "Mixte" or "Comparée"
- A title ("Titre"), which is a short text. Some themes do not have a title ("Pas de titre")
- A participation rule ("Participation") describing the number of participants, which can be a fixed number, a per-team number, or special values such as "illimitée", "équivalente", or "tout le monde"
- A game category ("Category"), which are special constraints taken from a list of categories. It is also possible for the user to create a new category on the spot. A special category is "Libre", meaning that no special constraints will be used.
- A time limit ("Durée"), which is most often a number of minutes and seconds. Sometimes the time limit can be announced with special values such as "jusqu'à la fin du spectacle" or "pour la durée du texte". For themes with type "Comparée", the time limit will be announced such as "2 fois 3 minutes"

Barillets also have some metadata, such as the date, location and title of the show. It will also be possible to view some stats, such as the total duration (sum of time limits), type proportions, "Libre" categories proportion.

A full barillet is 18 themes, but a barillet can be in a draft state with a different number of themes.

Barillets will be exportable in CSV, JSON or Excel format, and a PDF generation of the barillet in card forms for printing will also be available

The app will make it easy to manage the barillet list, with options such as folders, duplicate, delete, export, import from CSV, import from JSON. Bulk operations will also be possible.
