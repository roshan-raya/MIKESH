export const reportingWeights:Record<string,Record<string,string>>={
  ENGLISH:{'Production of Writing':'38–43%','Knowledge of Language':'18–23%','Conventions of Standard English':'38–43%'},
  MATH:{'Number & Quantity':'10–12%',Algebra:'17–20%',Functions:'17–20%',Geometry:'17–20%','Statistics & Probability':'12–15%','Integrating Essential Skills':'20%',Modeling:'20% or more · overlaps other categories'},
  READING:{'Key Ideas and Details':'44–52%','Craft and Structure':'26–33%','Integration of Knowledge and Ideas':'19–26%'},
  SCIENCE:{'Interpretation of Data':'38–50%','Scientific Investigation':'18–32%','Evaluating Scientific Arguments and Models with Evidence':'24–38%'},
};

export const topicScope:Record<string,string>={
  'Number and quantity':'Signed numbers, fractions, decimals, order of operations, number properties, prime factors',
  'Proportional reasoning':'Part-to-whole ratios, unit conversions, direct and inverse variation, percentage bases, successive changes, similarity, and combined rates',
  'Ratios and units':'Unit conversion, equivalent ratios, proportions, scales and unit analysis',
  'Linear equations':'One-variable equations, slope, intercepts and equation construction',
  'Systems and inequalities':'Inequality sign changes, graphing, substitution, elimination and constraints',
  'Quadratics':'Factoring, zero-product property, completing the square, discriminants and roots',
  'Polynomial and rational expressions':'Operations, factoring, division, restrictions and extraneous roots',
  'Functions':'Definitions, notation, tables, piecewise rules, composition and inverses',
  'Geometry':'Angles, parallel lines, symmetry, quadrilaterals, polygons, perimeter and area',
  'Triangles and trigonometry':'Similarity, congruence, special right triangles and trigonometric ratios',
  'Statistics and probability':'Averages, spread, sample spaces, complementary events and interpreting results',
  'Punctuation':'Commas, semicolons, colons, apostrophes, dashes and lists',
  'Sentence boundaries':'Parts of speech as needed, independent and dependent clauses, fragments and run-ons',
  'Pronouns':'Agreement, reference, case and shifts in person',
  'Organization':'Relevant details, sentence placement, paragraph order, introductions and conclusions',
  'Purpose and relevance':'Writing goals, audience, rhetorical choices and supporting evidence',
  'Main idea':'Summaries and themes in literary, humanities, social science and natural science passages',
  'Text structure':'Paragraph purpose, text organization and time-efficient passage mapping',
  'Evidence':'Relevant lines, comparative evidence and interpreting the strength of a claim',
  'Interpreting data':'Read axes, units and legends, compare values and infer trends',
  'Experimental design':'Variables, controls, replicates, research summaries and confounds',
  'Analyze perspectives':'Thesis, assumptions, counterarguments and qualification',
  'Develop reasoning':'Relevant examples, explanation, warrants and implications',
  'Organize an argument':'Paragraph development, transitions and coherence',
  'Use precise language':'Sentence clarity, revision, editing and conventions',
};

export const plannedPrerequisites:Record<string,string>={
  Functions:'Linear equations','Domain and range':'Functions','Graphs and transformations':'Functions',
  Quadratics:'Polynomial and rational expressions','Polynomial and rational expressions':'Linear equations',
  'Conditional probability':'Statistics and probability','Trigonometric functions':'Triangles and trigonometry',
  'Parallel structure':'Sentence boundaries',Punctuation:'Sentence boundaries',Organization:'Transitions',
  Evidence:'Inference','Paired passages':'Comparisons','Claims and reasoning':'Evidence',
  Interpolation:'Graphs and tables','Predict additional trials':'Experimental design','Conflicting viewpoints':'Experimental design',
  'Develop reasoning':'Analyze perspectives','Organize an argument':'Develop reasoning','Use precise language':'Organize an argument',
};
