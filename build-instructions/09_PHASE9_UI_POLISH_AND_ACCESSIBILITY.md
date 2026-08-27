# Phase 9 — UI Polish, Responsiveness & Accessibility

**Goal:** Deliver a clean, modern, aesthetically pleasing experience that still respects Moodle’s constraints and works on the devices universities actually use.

## 9.1 Visual System

- Colour palette defined via CSS custom properties under `.tella-workshop`
- Generous whitespace, 12–16 px radius, soft elevation
- Consistent corner placement of the profit counter across all four screens
- Typography: system UI stack + one modern geometric sans for headings if desired
- Slope colour coding: green (positive) / amber (negative) — never pure red for “reduce this”

## 9.2 Responsive Behaviour

- Desktop: two-panel layouts (Screen A, B)
- Tablet / landscape phone: stacked or collapsible panels
- Portrait phone: prioritise the interactive element; inputs may collapse into a drawer
- Touch targets ≥ 44 px

## 9.3 Accessibility

- All interactive controls keyboard operable
- ARIA labels on sliders, toggle buttons and the slope sentence
- Sufficient colour contrast (WCAG AA)
- Focus visible styles that do not rely solely on colour
- Screen-reader friendly live region for the profit counter and slope updates

## 9.4 Offline Considerations

- Core four screens and all arithmetic work without network
- Cached sample data
- Report PDF generation client-side
- Progress sync queues and retries when connectivity returns

## 9.5 Acceptance Criteria

- [ ] Visual language is consistent and modern across all screens
- [ ] No Moodle theme styles leak into the workshop chrome
- [ ] Keyboard navigation covers every critical path
- [ ] Colour contrast meets WCAG AA
- [ ] Core interaction remains fully functional offline

Polish can continue in parallel with testing.