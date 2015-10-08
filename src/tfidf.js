var WordList = function(text) {

  var countWords = function(text, opt_bagToAppend) {
        var bag = (opt_bagToAppend) ? opt_bagToAppend : {},

            clean = function(str) {
              return str.replace(/\[|\.|,|\]|:|\"/g, '').trim();
            },

            tokens = text.replace(/(?:\r\n|\r|\n)/g, ' ').replace(/\t/g, ' ').split(' ');

        // Remove dates, numbers and strings of length < 2
        tokens = jQuery.grep(tokens, function(token) {
          var len = token.trim().length,
              date = new Date(token),
              number = parseFloat(token);

          return (len > 1) && (token.indexOf('http://') !== 0) &&
            (token.indexOf('https://') !== 0) && (token.indexOf('href=') !== 0) &&
            (isNaN(date.getTime())) && (isNaN(number));
        });

        jQuery.each(tokens, function(idx, token) {
          var word = clean(token),
              count = bag[word];
          if (count)
            bag[word] = count + 1;
          else
            bag[word] = 1;
        });

        return bag;
      },

      append = function(text) {
        countWords(text, wordList);
      },

      wordList = (text) ? countWords(text) : {};

  this.terms = wordList;
  this.append = append;

};


var TFIDF = {

  compute: function(corpus, document, opt_limit, opt_threshold) {
    var corpusTerms = corpus.terms,
        docTerms = document.terms,
        unsorted = {}, sorted = [],
        term, countInDocument, countInCorpus;

    for (term in docTerms) {
      if (docTerms.hasOwnProperty(term)) {
        countInDocument = docTerms[term];
        countInCorpus = corpusTerms[term]; // Can never be null; if it is let's crash - would mean bug!
        unsorted[term] = countInDocument / countInCorpus;
      }
    }

    for (term in unsorted) {
      if (unsorted.hasOwnProperty(term))
        sorted.push({ term: term, score: unsorted[term] });
    }

    sorted.sort(function(a, b) {
      return b.count - a.count;
    });

    if (opt_threshold)
      sorted = jQuery.grep(sorted, function(val) {
        return val.score >= opt_threshold;
      });

    if (opt_limit)
      return sorted.slice(0, opt_limit);
    else
      return sorted;
  }

};
