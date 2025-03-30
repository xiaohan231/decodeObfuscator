var url = getUrl(result,book.bookUrl);
var res = java.t2s(java.ajax(url));
if(!new RegExp(KEY).test(res)){
    domain = String(java.get('Domain'));
    cache.delete(domain + 'cache');
}
if (!new RegExp(KEY).test(res) || /no-js/.test(res)) {
    for (i = 0; i < N; i++) {
        sleep(1000);
        url = getUrl(result,book.bookUrl);
        res = java.t2s(java.ajax(url));
        if (new RegExp(KEY).test(res) && !/no-js/.test(res)) {break}
    }
}
java.setContent(res);
if (/_\d+=\{[^}]*\}/.test(res)) {
  var jsp = java.getElement("head > script:not([src]).-1");
  eval(String(jsp.html()));
  var jspt = java.getElement(".mybox > script:not([src])").html();
  var obj = eval("(" + String(jspt.match(/_\d+=(\{[^}]*\})/)[1]) + ")");
  var sort = {};
  var cid = parseInt(bookinfo.chapterid) + 3421001;
  var aid = parseInt(bookinfo.articleid) + 3061711;
  for (var key in obj) {
    sort[(key ^ cid) - aid] = (obj[key] ^ cid) - aid;
  }
  var arr = Array.from(java.getElements(".txtnav p"));
  arr.unshift('');
  txt = arr.map((t, i) => sort[i] ? arr[sort[i]] + "<br><br>" : i != arr.length - 1 ? t + "<br><br>" : t).join("");
  txt;
} else {
  var J = org.jsoup.Jsoup.parse(res);
  String(J.select('#txtcontent,.txtnav,.content,.contxt')[0].html()).replace(/<div[\S\s]+?script[\S\s]+?div>/g,'');
}
