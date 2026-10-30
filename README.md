# View as JSON

Reddit moderation app for diagnostics.

Source: [https://github.com/ForroKulcs/viewasjson](https://github.com/ForroKulcs/viewasjson)

Adds moderator menu items that open a dialog with the raw JSON in a text area, ready to copy:

- **View Post as JSON** and **View Comment as JSON** on posts and comments
- **View User as JSON** on posts and comments (the author's user data)
- **View Subreddit as JSON** on the subreddit

## Settings (per subreddit)

- **JSON indentation**: no indentation, tab, or 1, 2, 4, 8 spaces.
- **Sort keys alphabetically**: off by default.
- **Include outer braces**: on by default. When off, the outer `{` and `}` are left out and the indentation is reduced by one level.
- **Show usernames in:** check the areas (subreddit, user, post, comment) where usernames should be visible. In every other area usernames are replaced with empty strings, so by default none are shown. Only username fields are affected. Usernames written inside text such as `body` or `title` are left as they are.
