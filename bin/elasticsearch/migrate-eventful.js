var elasticsearch = require('elasticsearch');

var client01 = new elasticsearch.Client({
		host: 'es01.wembli.com:9200',
});

var client02 = new elasticsearch.Client({
		host: 'es02.wembli.com:9200',
});
/*
{
"id":"E0-001-068350500-4",
"url":"http://eventful.com/braintree_ma/events/closing-clinic-braintree-/E0-001-068350500-4?utm_source=apis&utm_medium=apim&utm_campaign=apic",
"title":"Closing Clinic (Braintree)",
"description":"Learn how to:<ul><li>Get the prospect to close themselves<li>Get rid of think it overs<li>Be in total control of the sale</li></li></li></ul><p><strong>Register now to get your one-time FREE guest pass!</strong></p>",
"start_time":"2014-05-01 11:30:00",
"stop_time":"2014-05-01 13:30:00",
"venue_id":"V0-001-007186677-9",
"all_day":"0",
"recur_string":"",
"created":"2014-03-13 08:42:42",
"owner":"evdb",
"privacy":"1",
"free":"",
"price":"0.00 false Complimentary Admission 0.00 <br><br>",
"modified":"2014-03-14 13:01:58",
"popularity":"0004",
"performers":[],
"tickets":{
	"link":{
		"url":"http://www.eventbrite.com/e/closing-clinic-braintree-tickets-10927623817?aff=eventful/r/eventful",
		"description":"",
		"provider":"eventbrite.com",
		"time":"2014-03-13 08:42:44"}},
		"image":{"url":"http://s4.evcdn.com/images/block/I0-001/015/689/591-5.jpeg_/closing-clinic-braintree-91.jpeg",
		"width":"128",
		"height":"128",
		"block":{
			"url":"http://s4.evcdn.com/images/block/I0-001/015/689/591-5.jpeg_/closing-clinic-braintree-91.jpeg",
			"width":"128",
			"height":"128"}
			"large":{
				"url":"http://s4.evcdn.com/images/large/I0-001/015/689/591-5.jpeg_/closing-clinic-braintree-91.jpeg"
				"width":"480"
				"height":"480"
			}
		}
		"categories":{
			"category":{
				"id":"other"
				"name":"Other &amp; Miscellaneous"
			}
		},
		"subcategories":{}
	}
}
*/
var mappings = {
	'events': {
		"_id": {
			"path":"id",
		},
    "properties" : {
      "all_day" : {
        "type" : "string"
      },
      "categories" : {
        "properties" : {
          "category" : {
            "properties" : {
              "id" : {
                "type" : "string"
              },
              "name" : {
                "type" : "string"
              }
            }
          }
        }
      },
      "created" : {
        "type" : "date",
        "format":"dateOptionalTime||yyyy-MM-dd HH:mm:ss"
      },
      "description" : {
        "type" : "string"
      },
      "free" : {
        "type" : "string"
      },
      "id" : {
        "type" : "string"
      },
      "image" : {
        "properties" : {
          "block" : {
            "properties" : {
              "height" : {
                "type" : "integer"
              },
              "url" : {
                "type" : "string"
              },
              "width" : {
                "type" : "integer"
              }
            }
          },
          "categories" : {
            "properties" : {
              "category" : {
                "properties" : {
                  "id" : {
                    "type" : "string"
                  },
                  "name" : {
                    "type" : "string"
                  }
                }
              }
            }
          },
          "height" : {
            "type" : "integer"
          },
          "large" : {
            "properties" : {
              "height" : {
                "type" : "integer"
              },
              "url" : {
                "type" : "string"
              },
              "width" : {
                "type" : "integer"
              }
            }
          },
          "subcategories" : {
            "properties" : {
              "subcategory" : {
                "properties" : {
                  "id" : {
                    "type" : "string"
                  },
                  "name" : {
                    "type" : "string"
                  },
                  "parent" : {
                    "type" : "string"
                  },
                  "short_name" : {
                    "type" : "string"
                  }
                }
              }
            }
          },
          "url" : {
            "type" : "string"
          },
          "width" : {
            "type" : "integer"
          }
        }
      },
      "modified" : {
        "type" : "date",
        "format":"dateOptionalTime||yyyy-MM-dd HH:mm:ss"
      },
      "owner" : {
        "type" : "string"
      },
      "performers" : {
        "properties" : {
          "categories" : {
            "properties" : {
              "category" : {
                "properties" : {
                  "id" : {
                    "type" : "string"
                  },
                  "name" : {
                    "type" : "string"
                  }
                }
              }
            }
          },
          "performer" : {
            "properties" : {
              "id" : {
                "type" : "string"
              }
            }
          },
          "tickets" : {
            "properties" : {
              "link" : {
                "properties" : {
                  "provider" : {
                    "type" : "string"
                  },
                  "time" : {
                    "type" : "date",
						        "format":"dateOptionalTime||yyyy-MM-dd HH:mm:ss"
                  },
                  "url" : {
                    "type" : "string"
                  }
                }
              }
            }
          }
        }
      },
      "popularity" : {
        "type" : "integer"
      },
      "price" : {
        "type" : "string"
      },
      "privacy" : {
        "type" : "boolean"
      },
      "recur_string" : {
        "type" : "string"
      },
      "start_time" : {
        "type" : "date",
        "format":"dateOptionalTime||yyyy-MM-dd HH:mm:ss"
      },
      "stop_time" : {
        "type" : "date",
        "format":"dateOptionalTime||yyyy-MM-dd HH:mm:ss"
      },
      "subcategories" : {
        "properties" : {
          "subcategory" : {
            "properties" : {
              "id" : {
                "type" : "string"
              },
              "name" : {
                "type" : "string"
              },
              "parent" : {
                "type" : "string"
              },
              "short_name" : {
                "type" : "string"
              }
            }
          }
        }
      },
      "tickets" : {
        "properties" : {
          "categories" : {
            "properties" : {
              "category" : {
                "properties" : {
                  "id" : {
                    "type" : "string"
                  },
                  "name" : {
                    "type" : "string"
                  }
                }
              }
            }
          },
          "image" : {
            "properties" : {
              "block" : {
                "properties" : {
                  "height" : {
                    "type" : "integer"
                  },
                  "url" : {
                    "type" : "string"
                  },
                  "width" : {
                    "type" : "integer"
                  }
                }
              },
              "categories" : {
                "properties" : {
                  "category" : {
                    "properties" : {
                      "id" : {
                        "type" : "string"
                      },
                      "name" : {
                        "type" : "string"
                      }
                    }
                  }
                }
              },
              "height" : {
                "type" : "integer"
              },
              "large" : {
                "properties" : {
                  "height" : {
                    "type" : "integer"
                  },
                  "url" : {
                    "type" : "string"
                  },
                  "width" : {
                    "type" : "integer"
                  }
                }
              },
              "subcategories" : {
                "properties" : {
                  "subcategory" : {
                    "properties" : {
                      "id" : {
                        "type" : "string"
                      },
                      "name" : {
                        "type" : "string"
                      },
                      "parent" : {
                        "type" : "string"
                      },
                      "short_name" : {
                        "type" : "string"
                      }
                    }
                  }
                }
              },
              "url" : {
                "type" : "string"
              },
              "width" : {
                "type" : "integer"
              }
            }
          },
          "link" : {
            "properties" : {
              "provider" : {
                "type" : "string"
              },
              "time" : {
                "type" : "date",
				        "format":"dateOptionalTime||yyyy-MM-dd HH:mm:ss"
              },
              "url" : {
                "type" : "string"
              }
            }
          },
          "subcategories" : {
            "properties" : {
              "subcategory" : {
                "properties" : {
                  "id" : {
                    "type" : "string"
                  },
                  "name" : {
                    "type" : "string"
                  },
                  "parent" : {
                    "type" : "string"
                  },
                  "short_name" : {
                    "type" : "string"
                  }
                }
              }
            }
          }
        }
      },
      "title" : {
        "type" : "string"
      },
      "url" : {
        "type" : "string"
      },
      "venue_id" : {
        "type" : "string"
      }
    }
  }
};

client01.indices.delete({index:'eventful'}, function(err, res) {
	console.log(err);
	console.log(res);

	client01.indices.create({index:'eventful'}, function(err, res) {
		var handleType = function(type) {
			console.log('type: '+type);

			var mapping = {};
			mapping[type] = mappings[type];
			console.log(mapping);
			/* set the mapping for the indices */
			client01.indices.putMapping({
				index:'eventful',
				type: type,
				body: mapping
			}, function(err, resp) {
				if (err) {
					console.log(err);
					process.exit(0);
				}
				var cnt = 0;
				// first we do a search, and specify a scroll timeout
				client02.search({
					index:'eventful',
					type:type,
				  searchType: 'scan',
				  query: {match_all:{}},
				  scroll: '1m',
				  size:10
				}, function getMoreUntilDone(error, response) {
					if (error) {
						console.log(error);
						process.exit(0);
					}

					if (response.hits.total !== cnt && !response.hits.hits[0]) {
						console.log('getting more');
				    // now we can call scroll over and over
				    client02.scroll({
				      scrollId: response._scroll_id,
				      scroll: '1m'
				    }, getMoreUntilDone);
				    return;
					}

					var cnt2 = 0;
				  response.hits.hits.forEach(function (hit) {
				  	var l = response.hits.hits.length;
					  var b = hit._source;
					  if (b.stop_time === "") {
					  	b.stop_time = null;
					  }
						client01.index({
							index: 'eventful',
							type: type,
							body: b
						}, function(err, res) {
				  		cnt++;
					  	cnt2++;
							if (err) {
								console.log('err creating index');
								console.log(err);
							}

							if (l === cnt2) {
							  if (response.hits.total !== cnt) {
							  	console.log('not finished scroll again');
							    // now we can call scroll over and over
							    client02.scroll({
							      scrollId: response._scroll_id,
							      scroll: '1m'
							    }, getMoreUntilDone);

							  } else {
							    console.log('done with '+type);
							    process.exit(0);
							  }
							}
						});
				  });
				});
			});
		};
		handleType('events');
	});
});
