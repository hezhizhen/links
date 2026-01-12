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
	for (const link of linksData) {
		for (const tag of link.tags) {
			tagCount[tag] = (tagCount[tag] || 0) + 1;
		}
	}
	return Object.entries(tagCount).sort((a, b) => a[0].localeCompare(b[0]));
}

function renderTags() {
	const container = document.getElementById("tags-filter");
	container.innerHTML = "";

	const tags = getTagsWithCount();

	for (const [tag, count] of tags) {
		const btn = document.createElement("button");
		btn.className = "tag-btn";
		btn.dataset.tag = tag;

		btn.appendChild(document.createTextNode(tag + " "));

		const countSpan = document.createElement("span");
		countSpan.className = "tag-count";
		countSpan.textContent = count;
		btn.appendChild(countSpan);

		btn.addEventListener("click", () => toggleTag(tag));
		container.appendChild(btn);
	}
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
	for (const btn of document.querySelectorAll(".tag-btn")) {
		btn.classList.toggle("active", selectedTags.has(btn.dataset.tag));
	}
}

function filterLinks() {
	return linksData.filter((link) => {
		// Tag filter (AND logic: must have all selected tags)
		if (selectedTags.size > 0) {
			const hasAllTags = [...selectedTags].every((tag) =>
				link.tags.includes(tag),
			);
			if (!hasAllTags) return false;
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

function createCardElement(link) {
	const article = document.createElement("article");
	article.className = "card";

	// Card header
	const header = document.createElement("div");
	header.className = "card-header";

	// Cover image or placeholder
	if (link.cover) {
		const img = document.createElement("img");
		img.src = link.cover;
		img.alt = link.title;
		img.className = "card-cover";
		header.appendChild(img);
	} else {
		const placeholder = document.createElement("div");
		placeholder.className = "card-cover-placeholder";
		placeholder.textContent = link.title.charAt(0).toUpperCase();
		header.appendChild(placeholder);
	}

	// Title section
	const titleSection = document.createElement("div");
	titleSection.className = "card-title-section";

	const h2 = document.createElement("h2");
	h2.className = "card-title";
	const titleLink = document.createElement("a");
	titleLink.href = link.link;
	titleLink.target = "_blank";
	titleLink.rel = "noopener noreferrer";
	titleLink.textContent = link.title;
	h2.appendChild(titleLink);
	titleSection.appendChild(h2);

	const domainLink = document.createElement("a");
	domainLink.className = "card-domain";
	domainLink.href = link.link;
	domainLink.target = "_blank";
	domainLink.rel = "noopener noreferrer";
	domainLink.textContent = link.link;
	titleSection.appendChild(domainLink);

	if (link.description) {
		const desc = document.createElement("p");
		desc.className = "card-description";
		desc.textContent = link.description;
		titleSection.appendChild(desc);
	}

	header.appendChild(titleSection);
	article.appendChild(header);

	// Tags
	const tagsDiv = document.createElement("div");
	tagsDiv.className = "card-tags";
	for (const tag of link.tags) {
		const tagSpan = document.createElement("span");
		tagSpan.className = "card-tag" + (selectedTags.has(tag) ? " active" : "");
		tagSpan.textContent = tag;
		tagSpan.addEventListener("click", () => toggleTag(tag));
		tagsDiv.appendChild(tagSpan);
	}
	article.appendChild(tagsDiv);

	// Note
	if (link.note) {
		const noteDiv = document.createElement("div");
		noteDiv.className = "card-note";
		noteDiv.textContent = link.note;
		article.appendChild(noteDiv);
	}

	// Highlights
	if (link.highlights.length > 0) {
		const highlightsDiv = document.createElement("div");
		highlightsDiv.className = "card-highlights";

		const toggle = document.createElement("span");
		toggle.className = "highlights-toggle";
		toggle.textContent = `Highlights (${link.highlights.length})`;

		const ul = document.createElement("ul");
		ul.className = "highlights-list";
		for (const h of link.highlights) {
			const li = document.createElement("li");
			li.textContent = h;
			ul.appendChild(li);
		}

		toggle.addEventListener("click", () => {
			ul.classList.toggle("show");
		});

		highlightsDiv.appendChild(toggle);
		highlightsDiv.appendChild(ul);

		article.appendChild(highlightsDiv);
	}

	return article;
}

function renderCards() {
	const container = document.getElementById("cards-grid");
	const emptyState = document.getElementById("empty-state");
	const filtered = filterLinks();

	container.innerHTML = "";

	if (filtered.length === 0) {
		emptyState.style.display = "block";
	} else {
		for (const link of filtered) {
			container.appendChild(createCardElement(link));
		}
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

// Search handler
document.getElementById("search").addEventListener("input", (e) => {
	searchQuery = e.target.value.trim();
	renderCards();
});

// Initialize
init();
