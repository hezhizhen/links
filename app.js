const selectedTags = new Set();
let searchQuery = "";

function init() {
	renderTotalCount();
	renderTags();
	renderCards();
}

function renderTotalCount() {
	document.getElementById("total-count").textContent = linksData.length;
}

function getTagsWithCount() {
	const tagCount = {};
	linksData.forEach((link) => {
		link.tags.forEach((tag) => {
			tagCount[tag] = (tagCount[tag] || 0) + 1;
		});
	});
	return Object.entries(tagCount).sort((a, b) => a[0].localeCompare(b[0]));
}

function renderTags() {
	const container = document.getElementById("tags-filter");
	const tags = getTagsWithCount();

	container.innerHTML = tags
		.map(
			([tag, count]) => `
    <button class="tag-btn" data-tag="${tag}">${tag} <span class="tag-count">${count}</span></button>
  `,
		)
		.join("");

	container.querySelectorAll(".tag-btn").forEach((btn) => {
		btn.addEventListener("click", () => toggleTag(btn.dataset.tag));
	});
}

function toggleTag(tag) {
	if (selectedTags.has(tag)) {
		selectedTags.delete(tag);
	} else {
		selectedTags.add(tag);
	}
	updateTagButtons();
	renderCards();
}

function updateTagButtons() {
	document.querySelectorAll(".tag-btn").forEach((btn) => {
		btn.classList.toggle("active", selectedTags.has(btn.dataset.tag));
	});
}

function filterLinks() {
	return linksData.filter((link) => {
		// Tag filter
		if (selectedTags.size > 0) {
			const hasTag = link.tags.some((tag) => selectedTags.has(tag));
			if (!hasTag) return false;
		}

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const searchable = [
				link.title,
				link.description,
				link.note,
				...link.tags,
				...link.highlights,
			]
				.join(" ")
				.toLowerCase();
			if (!searchable.includes(query)) return false;
		}

		return true;
	});
}

function createCardHTML(link) {
	const coverHTML = link.cover
		? `<img src="${link.cover}" alt="${link.title}" class="card-cover">`
		: `<div class="card-cover-placeholder">${link.title.charAt(0).toUpperCase()}</div>`;

	const tagsHTML = link.tags
		.map(
			(tag) =>
				`<span class="card-tag${selectedTags.has(tag) ? " active" : ""}" onclick="toggleTag('${tag}')">${tag}</span>`,
		)
		.join("");

	const noteHTML = link.note ? `<div class="card-note">${link.note}</div>` : "";

	const highlightsHTML =
		link.highlights.length > 0
			? `
    <div class="card-highlights">
      <span class="highlights-toggle" onclick="toggleHighlights(this)">
        Highlights (${link.highlights.length})
      </span>
      <ul class="highlights-list">
        ${link.highlights.map((h) => `<li>${h}</li>`).join("")}
      </ul>
    </div>
  `
			: "";

	return `
    <article class="card">
      <div class="card-header">
        ${coverHTML}
        <div class="card-title-section">
          <h2 class="card-title">
            <a href="${link.link}" target="_blank" rel="noopener noreferrer">${link.title}</a>
          </h2>
          <a class="card-domain" href="${link.link}" target="_blank" rel="noopener noreferrer">${link.link}</a>
        </div>
      </div>
      <p class="card-description">${link.description}</p>
      <div class="card-tags">${tagsHTML}</div>
      ${noteHTML}
      ${highlightsHTML}
    </article>
  `;
}

function renderCards() {
	const container = document.getElementById("cards-grid");
	const emptyState = document.getElementById("empty-state");
	const filtered = filterLinks();

	if (filtered.length === 0) {
		container.innerHTML = "";
		emptyState.style.display = "block";
	} else {
		container.innerHTML = filtered.map(createCardHTML).join("");
		emptyState.style.display = "none";
	}
}

// biome-ignore lint/correctness/noUnusedVariables: called from HTML onclick
function resetFilters() {
	selectedTags.clear();
	searchQuery = "";
	document.getElementById("search").value = "";
	updateTagButtons();
	renderCards();
}

// biome-ignore lint/correctness/noUnusedVariables: called from HTML onclick
function toggleHighlights(element) {
	const list = element.nextElementSibling;
	list.classList.toggle("show");
}

// Search handler
document.getElementById("search").addEventListener("input", (e) => {
	searchQuery = e.target.value.trim();
	renderCards();
});

// Initialize
init();
