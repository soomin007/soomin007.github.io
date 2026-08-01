/* games.js 의 GAMES 를 읽어 목차와 카드를 그린다. 여기는 건드릴 일이 거의 없다. */

(function () {
  var shelf = document.getElementById("shelf");
  var indexList = document.getElementById("indexList");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function action(href, label, cls) {
    var a = el("a", cls, label);
    a.href = href;
    if (!/^#/.test(href)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    return a;
  }

  GAMES.forEach(function (g) {
    /* --- 목차 띠 --- */
    var li = el("li", "index__item");
    var anchor = el("a", "index__anchor");
    anchor.href = "#" + g.id;
    anchor.style.setProperty("--tick", g.color);
    anchor.appendChild(el("span", "index__label", g.title));
    anchor.setAttribute("aria-label", g.title + " 로 이동");
    li.appendChild(anchor);
    indexList.appendChild(li);

    /* --- 카드 --- */
    var card = el("article", "card" + (g.first ? " card--lead" : "") + (g.status === "wip" ? " card--wip" : ""));
    card.id = g.id;
    card.style.setProperty("--tone", g.color);

    if (g.first) card.appendChild(el("span", "card__flag", "처음이라면"));

    card.appendChild(el("p", "card__kicker", g.kicker));
    card.appendChild(el("h2", "card__title", g.title));
    card.appendChild(el("p", "card__line", g.line));
    if (g.note) card.appendChild(el("p", "card__note", g.note));

    var plate = el("div", "plate");
    plate.appendChild(el("span", null, g.year));
    g.meta.forEach(function (m) { plate.appendChild(el("span", null, m)); });
    plate.appendChild(el("span", "plate__status", g.status === "wip" ? "개발 중" : "완성"));
    card.appendChild(plate);

    var acts = el("div", "acts");
    if (g.links.play) {
      acts.appendChild(action(g.links.play, g.status === "wip" ? "지금까지 만든 것 보기" : "바로 플레이", "act act--play"));
    }
    if (g.links.itch) acts.appendChild(action(g.links.itch, "itch.io", "act"));
    if (g.links.code) acts.appendChild(action(g.links.code, "소스", "act"));
    card.appendChild(acts);

    shelf.appendChild(card);
  });
})();
