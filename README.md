# “Now Now” for Git Things Done

A `TODO` system based on [South African Time](https://www.goodthingsguy.com/fun/now-now-just-now/).

## South African Time

South African English (supposedly) has different meanings for the word “now”:

1. **Right Now** — should be done *very soon*, (though not necessarily now)
2. **Now Now** — pretty urgent, but cannot be done immediately
3. **Just Now** — needs to be done at some point… eventually
4. **Now** — we are aware of this thing, and maybe one day it might even get done

## How This Git Things Done Action Works

### Basically

* We create a comment with a **Now Now** heading
* You add task items to this item or any other heading from the “now” types list
* We provide an iOS/macOS Shortcut to easily add to each (we ask which) for today’s entry.

### There’s More

* We “usher” this comment forward every day
* We remove checked items
* For unchecked items we increment a counter letting you know how long an item has been pending
* For **Right Now** and **Now Now** we increment every day
* For **Just Now** and **Now** we increment once a week
* We keep **Just Now** and **Now** items concealed up in `<details>` wrappers so you don’t get antsy
* We believe there should only be five items in your **Now Now** list
  * If you add more the next day we prune it for you
  * If there are less we start adding from the top of your **Just Now** list
  * Thus order is important (you can drag and drop task items on GitHub)

## How to Use This GitTD-Action

### Installation

Ensure you add:

```yaml
- uses: gtd-actions/now-now@v1
```

To your daily `porter.yml`.

See [`action.yml`](./action.yml) for additional options.

### Using This Action to Git Things Done

**Right Now** items are considered so urgent they should be done today.
You typically will not add things here.
You add things here when if you don’t do them today you will get fired/die/someone else will die, etc.

**Now Now** items are your bread and butter. There can only be 5. Each day you should *try* to clear them. But it’s ok if you don’t.

**Just Now** is where you put things you need to get done in the next few weeks.

**Now** items are pipe dreams that you hope one day (perhaps once Git Things Done has made you more organized?) you will get done.

### Caveats

Things that aren’t task items or headings that are known will not be ushered.


## Adding New “Now Now”s

We have tooling to facilitate adding new task items:

> [@git-things-done/new-now-now](https://github.com/git-things-done/new-now-now)


## Bonus

In effect you have a TODO list history since every day is its own issue.
The possibilities with that are interesting… get making!
