async function loadData() {
  try {
    const res = await fetch('./data/experience.json');
    if (!res.ok) throw new Error('File not found');
    const experiences = await res.json();
    console.log(experiences);

    const expContainer = document.getElementById('experience-timeline');
    experiences.forEach(exp => {
      const block = document.createElement('div');
      block.className = 'timeline__block';
      block.innerHTML = `
        <div class="timeline__bullet"></div>
        <div class="timeline__header">
          <h4 class="timeline__title">${exp.company}</h4>
          <h5 class="timeline__meta">${exp.role}</h5>
          <p class="timeline__timeframe">${exp.startDate} - ${exp.endDate}</p>
        </div>
        <div class="timeline__desc">
          <p>${exp.descriptions}</p>
        </div>
      `;
      expContainer.appendChild(block);
    });
  } catch (err) {
    console.error('Error loading experience:', err);
  }
}

loadData();
