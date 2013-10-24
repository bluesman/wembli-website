(function(c) {
	var e = {
		defaults: {
			MapId: null,
			MapSet: "tu",
			MapType: "Interactive",
			EventId: null,
			AutoSwitchToStatic: true,
			SeatingChartAutoCorrect: true,
			FailoverMapUrl: null,
			Columns: {
				flag: {
					Title: "",
					Sortable: false,
					Width: 53,
					Visible: false,
					Formatter: function(h, f, i) {
						var g = "";
						if (h.preferred) {
							g += '<span class="tuMapPreferred"></span>'
						}
						if (h.eticket) {
							g += '<span class="tuMapeTicket"></span>'
						}
						return g
					}
				},
				section: {
					Title: "Section",
					Sortable: true,
					Width: 150,
					SortType: "string",
					Visible: true
				},
				row: {
					Title: "Row",
					Sortable: true,
					SortType: "string",
					Visible: true
				},
				quantity: {
					Title: "Quantity",
					Sortable: true,
					SortType: "numeric",
					Visible: true,
					Formatter: function(h, f, i) {
						var g = "";
						if (typeof(i) == "object") {
							var g = '<select lang="Quantity">';
							c.each(i, function(k, j) {
								g += "<option>" + j + "</option>"
							});
							g += "</select>"
						} else {
							g = i + '<input type="hidden" value="' + i + '" lang="Quantity"/>'
						}
						return g
					}
				},
				price: {
					Title: "Price",
					Sortable: true,
					SortType: "numeric",
					Visible: true
				},
				notes: {
					Title: "",
					Width: 25,
					Sortable: false,
					Visible: true,
					Formatter: function(g, f, h) {
						if (h != "") {
							return '<span class="Notes" title="' + h + '"></span>'
						}
						return ""
					}
				},
				action: {
					Title: "",
					Sortable: false,
					Visible: true,
					Formatter: function(g, f, h) {
						return '<a class="BuyLink" href="javascript:void(0);" lang="' + g.id + '">' + e.Settings.BuyButtonText + "</a>"
					}
				}
			},
			DisplayListHeader: true,
			PreferredFirst: false,
			Tickets: [],
			TicketsFilter: {
				MinPrice: 0,
				MaxPrice: 0,
				Quantity: 0
			},
			TicketsSort: {
				Column: "section",
				Order: "ASC",
				SortType: "string"
			},
			TicketsListContainer: null,
			SectionViewContainer: null,
			SectionViewTrigger: "mouseover",
			TooltipSectionViewSize: "250",
			EnableTooltipSectionView: true,
			AlwaysShowTooltip: false,
			RowSelector: null,
			SectionSelector: null,
			PriceSelector: null,
			QuantitySelector: null,
			eTicketSelector: null,
			BuyButtonText: "Select",
			PreferredText: "Display Preferred Inventory First",
			ResetButtonText: "Reset",
			GroupsContainer: null,
			ControlsPosition: "Inside",
			ZoomLevel: 1,
			BgColor: "#FFFFFF",
			ServiceUrl: "http://imap.ticketutils.com",
			OnInit: null,
			OnClick: null,
			OnGroupClick: null,
			OnMouseover: null,
			OnMouseout: null,
			OnError: null,
			OnReset: null,
			OnTicketSelected: null,
			OnControlClick: null,
			ColorScheme: 0,
			HighlightStyle: {
				strokeWeight: 2,
				fillColor: "#0000FF",
				fillOpacity: 0.2
			},
			NormalStyle: {
				fillOpacity: 0,
				fillColor: "#FFFFFF",
				strokeColor: "#FFFFFF",
				strokeWeight: 0
			},
			SelectedStyle: {
				strokeWeight: 2,
				fillColor: "#FFFFFF",
				fillOpacity: 0.3
			},
			InactiveStyle: {
				strokeColor: "#FFFFFF",
				strokeWeight: 0,
				fillColor: "#666666",
				fillOpacity: 0.7
			},
			NoResultsFormatter: function() {
				return "No Tickets Found"
			},
			TooltipFormatter: function(h) {
				var f = '<div style="width:' + e.Settings.TooltipSectionViewSize + 'px;">';
				var g = (h.DisplayGroupName ? (h.Group.DisplayName != null ? h.Group.DisplayName : h.Group.Name) + " " : "") + h.DisplayName;
				if (e.Settings.ColorScheme != 2) {
					f += '<span class="SectionColor" style="background-color:' + h.Group.Color + ';"></span>'
				}
				f += '<span class="Title">' + g + "</span><br/>";
				if (h.SectionViewThumbnailUrl) {
					e.ShowSectionView(h.Key, "mouseover");
					if (e.Settings.EnableTooltipSectionView) {
						f += '<img src="' + h.SectionViewThumbnailUrl + '" alt="' + g + '" style="width:100%;height:' + Math.round(e.Settings.TooltipSectionViewSize / 2) + 'px"/>';
						f += '<div class="SectionViewZoom"></div>';
						f += "<br/>";
						f += '<div style="color:#666666;font-size:9px;padding-bottom:5px;">Approximate view from this section. May differ based on row, seat, camera or obstructions.</div>'
					}
				}
				if (h.Active) {
					if (h.Quantity > 0) {
						f += '<span class="tuMapHighlight">' + h.Quantity + "</span> ticket(s) available from " + h.MinPrice + (h.MinPrice != h.MaxPrice ? " to " + h.MaxPrice : "")
					}
				} else {
					f += "No Tickets currently available for this Section"
				}
				f += "</div>";
				return f
			}
		},
		Container: null,
		Map: null,
		Groups: {},
		Sections: {},
		Selection: [],
		SetOptions: function(f) {
			c.each(f, function(g, k) {
				e.Settings[g] = k;
				switch (g) {
					case "Tickets":
					case "Columns":
						if (e.RefreshType != "Reset") {
							e.RefreshType = "ProcessTickets"
						}
						break;
					case "PreferredFirst":
					case "TicketsSort":
						if (e.RefreshType != "Reset" && e.RefreshType != "ProcessTickets") {
							e.RefreshType = "SortTickets"
						}
						break;
					case "PreferredText":
					case "TicketsFilter":
						var m = e.Settings.TicketsFilter.Quantity;
						var n = 0;
						var j = "eq";
						if (typeof(e.Settings.TicketsFilter.Quantity) == "string") {
							var h = e.Settings.TicketsFilter.Quantity.indexOf("-");
							if (h != -1) {
								m = e.Settings.TicketsFilter.Quantity.substring(0, h);
								n = e.Settings.TicketsFilter.Quantity.substring(h + 1);
								j = "bt"
							} else {
								m = e.Settings.TicketsFilter.Quantity.replace(/[^0-9]+/g, "").toString();
								var l = c.trim(e.Settings.TicketsFilter.Quantity.replace(m, ""));
								if (l == "+") {
									j = "gt"
								}
							}
						}
						var i = {
							MinPrice: parseFloat(e.Settings.TicketsFilter.MinPrice),
							MaxPrice: parseFloat(e.Settings.TicketsFilter.MaxPrice),
							Quantity: parseInt(m),
							MaxQuantity: parseInt(n),
							Comparison: j,
							eTicket: e.Settings.TicketsFilter.eTicket
						};
						e.Settings.TicketsFilter = i;
						if (e.RefreshType != "Reset") {
							e.RefreshType = "ProcessTickets"
						}
						break;
					case "ZoomLevel":
						d.SetZoom(e.Settings.ZoomLevel);
						break;
					case "EventId":
					case "MapId":
					case "MapSet":
					case "MapType":
					case "Columns":
					case "TicketsListContainer":
					case "GroupsContainer":
					case "TooltipFormatter":
						e.RefreshType = "Reset";
						break
				}
			});
			return this
		},
		AddMapControl: function(h, f, g) {
			d.AddMapControl(h, f, g)
		},
		RemoveMapControl: function(f) {
			c(".tuMapControl").each(function() {
				if (c.trim(c(this).html()).toLowerCase() == f.toLowerCase()) {
					c(this).remove()
				}
			})
		},
		GetSelectedSections: function(g) {
			var f = [];
			c.each(e.Selection, function(l, i) {
				var k = e.Sections[i];
				var h = null;
				if (k) {
					if (g) {
						if (g.IncludeGroupName) {
							var j = e.Groups[k.GroupId];
							f.push((j.DisplayName != null ? j.DisplayName : j.Name) + " " + k.Name)
						} else {
							f.push(k.Name)
						}
						return
					} else {
						h = k.Mappings
					}
				} else {
					if (e.OtherSections[i]) {
						if (g) {
							f.push(e.OtherSections[i].Name);
							return
						} else {
							h = e.OtherSections[i].Mappings
						}
					}
				}
				c.each(h, function(n, m) {
					f.push(m)
				})
			});
			return f
		},
		GetSections: function(g) {
			var f = [];
			c.each(e.Sections, function(i, h) {
				if (g && h.Alias.length == 0) {
					return
				}
				f.push({
					Active: h.Active,
					Selected: h.Selected,
					Key: h.Key,
					Name: h.Name,
					DisplayName: h.DisplayName,
					DisplayGroupName: h.DisplayGroupName,
					Alias: h.Alias,
					ExactMatchAlias: h.ExactMatchAlias,
					Group: e.Groups[h.GroupId],
					SectionViewAvailable: h.IsSectionViewAvailable,
					SectionViewThumbnailUrl: h.SectionViewThumbnailUrl,
					SectionViewUrl: h.SectionViewUrl
				})
			});
			return f
		},
		GetOtherSections: function() {
			var f = [];
			c.each(e.OtherSections, function(h, g) {
				f.push({
					Name: g.Name,
					Alias: g.Alias,
					Enabled: g.Enabled,
					IsExactMatch: g.IsExactMatch
				})
			});
			return f
		},
		GetSectionsInGroup: function(g, h, f) {
			c.each(e.Sections, function(i, j) {
				if (j == null) {
					return
				}
				if (j && j.GroupId == g) {
					if (h != null && h.OnlyActive && !j.Active) {
						return
					}
					if (h != null && h.OnlyUnselected && j.Selected) {
						return
					}
					f(i, j)
				}
			})
		},
		HighlightGroup: function(f) {
			this.GetSectionsInGroup(f, {
				OnlyActive: true,
				OnlyUnselected: true
			}, function(g, h) {
				h.SetStyle(e.Settings.HighlightStyle)
			});
			return this
		},
		ResetGroup: function(f) {
			this.GetSectionsInGroup(f, {
				OnlyActive: true,
				OnlyUnselected: true
			}, function(g, h) {
				h.SetStyle(e.Settings.NormalStyle)
			});
			return this
		},
		HighlightSection: function(f, h) {
			if (!h) {
				f = e.GetSectionKey(f)
			}
			var g = e.Sections[f];
			if (g != null) {
				d.Trigger("OnMouseOver", e.Sections[f])
			}
			return this
		},
		ResetSection: function(f, h) {
			if (!h) {
				f = e.GetSectionKey(f)
			}
			var g = e.Sections[f];
			if (g != null) {
				d.Trigger("OnMouseOut", e.Sections[f])
			}
			return this
		},
		BlinkTimer: null,
		BlinkState: 1,
		Blink: function() {
			var f = e.Settings.HighlightStyle;
			if (e.BlinkState == 1) {
				f = e.Settings.SelectedStyle;
				e.BlinkState = 0;
				c(".tuMapControlSelected").addClass("tuMapControlBlink").removeClass("tuMapControlSelected")
			} else {
				e.BlinkState = 1;
				c(".tuMapControlBlink").addClass("tuMapControlSelected").removeClass("tuMapControlBlink")
			}
			c.each(e.Selection, function(i, g) {
				var h = e.Sections[g];
				if (h != null) {
					h.SetStyle(f)
				}
			})
		},
		FilterTickets: function(f, g, j, i) {
			if (!j) {
				if (e.Selection.length > 0) {
					c.each(e.Selection, function(k, l) {
						if (e.Sections[l]) {
							e.Sections[l].Selected = false
						}
					});
					e.Selection = [];
					clearInterval(e.BlinkTimer);
					e.BlinkTimer = null
				}
				f = e.GetSectionKey(f)
			}
			if (g) {
				e.Selection.push(f);
				if (e.BlinkTimer == null) {
					e.BlinkTimer = setInterval(e.Blink, 500)
				}
			} else {
				var h = -1;
				while ((h = c.inArray(f, e.Selection)) > -1) {
					e.Selection.splice(h, 1)
				}
				if (e.Selection.length == 0) {
					clearInterval(e.BlinkTimer);
					e.BlinkTimer = null
				}
			} if (!i) {
				e.ProcessTickets();
				e.SortTickets();
				e.ShowTickets()
			}
		},
		ToggleSelection: function(h, i, f) {
			if (!i) {
				h = e.GetSectionKey(h)
			}
			var g = e.Sections[h];
			if (!g || !g.Active) {
				return
			}
			if (g.Selected) {
				if (e.Settings.GroupsContainer != null) {
					e.Groups[g.GroupId].Selected = false
				}
				if (e.Selection.length == 0) {
					e.HideSectionView("click")
				} else {
					e.ShowSectionView(h, "click")
				}
			} else {
				e.ShowSectionView(h, "click")
			}
			g.Selected = !g.Selected;
			e.FilterTickets(h, g.Selected, true, f);
			return this
		},
		ToggleAll: function() {
			c.each(e.Sections, function(g, f) {
				e.ToggleSelection(f.Key, true, true)
			});
			e.ProcessTickets();
			e.SortTickets();
			e.ShowTickets()
		},
		ProcessTickets: function() {
			var i = (e.Settings.TicketsListContainer == null && (e.Settings.Tickets == null || e.Settings.Tickets.length == 0) && e.Settings.RowSelector == null);
			c.each(e.Sections, function(l, m) {
				m.Active = i;
				m.FilteredTickets = 0;
				m.MinPrice = 9007199254740992;
				m.MaxPrice = 0;
				m.MinPriceValue = "";
				m.MinPriceValue = "";
				m.Quantity = 0;
				m.SetStyle(e.Settings.InactiveStyle)
			});
			var k = e.Settings.Tickets;
			e.FilteredTickets = [];
			var f = 0;
			if (!e.Settings.TicketsListContainer && e.Settings.RowSelector && (k == null || k.length == 0)) {
				if (!e.Settings.SectionSelector) {
					throw ("Section Selector Required")
				}
				k = [];
				var h = /<\S[^><]*>/g;
				c(e.Settings.RowSelector).each(function() {
					var o = c(this).find(e.Settings.SectionSelector).text().replace(h, "");
					var l = (e.Settings.PriceSelector ? c(this).find(e.Settings.PriceSelector).text().replace(h, "") : 0);
					var q = 0;
					if (e.Settings.QuantitySelector) {
						var r = c(this).find(e.Settings.QuantitySelector);
						if (r.length > 0) {
							if (r.length == 1) {
								q = c.trim(r.text().replace(h, ""))
							} else {
								q = [];
								c.each(r, function(s, t) {
									q.push(parseInt(c.trim(c(t).text().replace(h, ""))))
								})
							}
						}
					}
					var m = (e.Settings.eTicketSelector ? c(this).find(e.Settings.eTicketSelector).length > 0 : false);
					var p = c(this);
					var n = e.GetSectionKey(o);
					c(this).hover(function() {
						e.HighlightSection(n, true)
					}, function() {
						e.ResetSection(n, true)
					});
					k.push({
						SectionKey: n,
						section: o,
						RowObject: p,
						price: l,
						quantity: q,
						eticket: m
					})
				})
			}
			var j = e.IsFilterSet();
			c.each(k, function(n, l) {
				if (l.SectionKey == null) {
					l.SectionKey = e.GetSectionKey(l.section)
				}
				if (l.price) {
					if (typeof(l.price) == "number") {
						l.PriceValue = l.price
					} else {
						l.PriceValue = parseFloat(l.price.replace(/[^0-9.-]+/g, ""))
					}
				}
				if (e.Settings.Columns.flag) {
					if (l.preferred) {
						e.Settings.Columns.flag.Visible = true;
						e.PreferredFlag = true
					}
					if (l.eticket) {
						e.Settings.Columns.flag.Visible = true;
						e.eTicketFlag = true
					}
				}
				l.MaxQuantity = 0;
				if (l.quantity) {
					if (typeof(l.quantity) == "object") {
						c.each(l.quantity, function(p, o) {
							if (parseInt(o) > l.MaxQuantity) {
								l.MaxQuantity = parseInt(o)
							}
						})
					} else {
						l.MaxQuantity = parseInt(l.quantity)
					}
				}
				if (l.MaxQuantity == 0) {
					return
				}
				var m = e.IsTicketFiltered(l);
				if (m && !(e.Selection.length > 0 && c.inArray(l.SectionKey, e.Selection) == -1)) {
					e.FilteredTickets.push(l)
				}
				if (e.Sections[l.SectionKey]) {
					if (m) {
						e.Sections[l.SectionKey].FilteredTickets++
					}
					if (e.Sections[l.SectionKey].MinPrice > l.PriceValue) {
						e.Sections[l.SectionKey].MinPrice = l.PriceValue;
						e.Sections[l.SectionKey].MinPriceValue = l.price
					}
					if (e.Sections[l.SectionKey].MaxPrice < l.PriceValue) {
						e.Sections[l.SectionKey].MaxPrice = l.PriceValue;
						e.Sections[l.SectionKey].MaxPriceValue = l.price
					}
					e.Sections[l.SectionKey].Quantity += l.MaxQuantity;
					e.Sections[l.SectionKey].Active = true
				}
			});
			k = null;
			c.each(e.Groups, function(l, m) {
				e.Groups[l].ActiveSections = 0
			});
			var g = false;
			c.each(e.Sections, function(l, m) {
				if (m.Active && !(j && m.FilteredTickets == 0)) {
					m.SetStyle(e.Settings.NormalStyle);
					e.Groups[m.GroupId].ActiveSections++;
					return
				}
				if (m.Selected) {
					e.Sections[l].Active = true;
					e.ToggleSelection(l, true, true);
					g = true
				}
				e.Sections[l].Active = false;
				m.SetStyle(e.Settings.InactiveStyle)
			});
			if (g) {
				e.ProcessTickets();
				e.SortTickets();
				e.ShowTickets()
			}
			if (e.Settings.ColorScheme != 2 && e.Settings.GroupsContainer != null && e.Groups) {
				e.GenerateGroups()
			}
		},
		SortTickets: function() {
			if (e.Settings.TicketsListContainer == null) {
				return
			}
			var i = e.Settings.TicketsSort.SortType;
			if (i == null) {
				i = "string"
			}
			var f = e.Settings.TicketsSort.Column;
			var g = e.Settings.Columns[e.Settings.TicketsSort.Column];
			if (g != null) {
				i = g.SortType
			}
			if (f == "price") {
				f = "PriceValue"
			} else {
				if (f == "quantity") {
					f = "MaxQuantity"
				} else {
					if (f == "section") {
						f = (e.MapError ? "section" : "SectionKey")
					}
				}
			}
			var h = e.Settings.TicketsSort.Order;
			e.FilteredTickets.sort(function(k, j) {
				var m = null;
				var l = null;
				var n = k.preferred == true;
				var o = j.preferred == true;
				if (i == "string") {
					m = k[f].toString().toUpperCase();
					l = j[f].toString().toUpperCase()
				} else {
					m = parseFloat(k[f]);
					l = parseFloat(j[f])
				} if (e.Settings.PreferredFirst && n != o) {
					if (h == "ASC") {
						return (n ? -1 : 1)
					} else {
						return (n ? -1 : 1)
					}
				}
				if (h == "ASC") {
					return (m < l) ? -1 : (m > l) ? 1 : 0
				} else {
					return (m < l) ? 1 : (m > l) ? -1 : 0
				}
			})
		},
		AddSectionMapping: function(f, g) {
			if (e.Sections[f]) {
				if (c.inArray(g, e.Sections[f].Mappings) == -1) {
					e.Sections[f].Mappings.push(g)
				}
			}
			if (e.OtherSections[f]) {
				if (c.inArray(g, e.OtherSections[f].Mappings) == -1) {
					e.OtherSections[f].Mappings.push(g)
				}
			}
		},
		GetSectionKey: function(g) {
			var f = "Unmapped";
			SectionName = g.toLowerCase();
			SectionName = c.trim(SectionName.replace(/[^0-9a-z]+/g, " "));
			var i = "";
			var k = "";
			var j = [];
			c.each(e.Groups, function(m, l) {
				c.each(l.Alias, function(n, p) {
					var o = SectionName.indexOf(p);
					if (o == -1) {
						return
					}
					if ((o == 0 || o == SectionName.length - p.length) && (p.length >= k.length)) {
						k = p;
						j.push({
							GroupId: l.Id,
							Alias: p
						});
						if (l.SectionCount == 1) {
							f = l.Id;
							return false
						} else {
							i = c.trim(SectionName.replace(k, ""));
							if (e.Sections[i + "_" + l.Id]) {
								f = i + "_" + l.Id;
								return false
							}
						}
					}
				});
				if (f != "Unmapped") {
					return false
				}
			});
			if (f != "Unmapped") {
				e.AddSectionMapping(f, g);
				return f
			}
			var h = [];
			c.each(j, function(l, m) {
				if (m.Alias.length == k.length) {
					h.push(m.GroupId)
				}
			});
			j = h;
			if (j.length == 0) {
				i = SectionName.replace(/[^0-9]+/g, "").toString();
				k = SectionName.replace(i, "")
			}
			c.each(e.Sections, function(n, m) {
				var l = e.Groups[m.GroupId];
				if (l == null) {
					return
				}
				if (m.Name.toLowerCase() == SectionName) {
					if (l.IsExactMatch && e.SectionCounts[SectionName] > 1) {
						return
					}
					f = m.Key;
					return false
				}
				if (m.Name.toLowerCase() == i) {
					if (!(l.IsExactMatch && c.inArray(l.Id, j) == -1)) {
						f = e.ResolveOtherSection(SectionName);
						if (f == "Unmapped") {
							f = m.Key
						} else {
							if (e.OtherSections[f]) {
								e.OtherSections[f].Enabled = true
							}
						}
						return false
					}
				}
				if (f == "Unmapped" && m.ExactMatchAlias != null && m.ExactMatchAlias.length > 0) {
					c.each(m.ExactMatchAlias, function(o, p) {
						if (p == SectionName) {
							f = m.Key;
							return false
						}
					})
				}
				if (f == "Unmapped" && m.Alias != null && m.Alias.length > 0) {
					c.each(m.Alias, function(o, p) {
						if (p == SectionName) {
							f = m.Key;
							return false
						} else {
							if (p == i) {
								if (l.IsExactMatch && c.inArray(l.Id, j) == -1) {
									return
								}
								f = e.ResolveOtherSection(SectionName);
								if (f == "Unmapped") {
									f = m.Key
								} else {
									if (e.OtherSections[f]) {
										e.OtherSections[f].Enabled = true
									}
								}
								return false
							}
						}
					})
				}
			});
			if (f == "Unmapped") {
				f = e.ResolveOtherSection(SectionName);
				if (e.OtherSections[f]) {
					e.OtherSections[f].Enabled = true
				}
			}
			e.AddSectionMapping(f, g);
			return f
		},
		ResolveOtherSection: function(g) {
			var f = "Unmapped";
			c.each(e.OtherSections, function(i, h) {
				if (h.IsExactMatch) {
					if (i.toLowerCase() == g) {
						f = i;
						return false
					}
				} else {
					if (g.indexOf(i.toLowerCase()) != -1) {
						f = i;
						return false
					}
				} if (h.Alias != null && h.Alias.length > 0) {
					c.each(h.Alias, function(j, k) {
						if (h.IsExactMatch) {
							if (k == g) {
								f = i;
								return false
							}
						} else {
							if (g.indexOf(k) != -1) {
								f = i;
								return false
							}
						}
					})
				}
			});
			return f
		},
		IsFilterSet: function() {
			return (e.Settings.TicketsFilter.MinPrice > 0 || e.Settings.TicketsFilter.MaxPrice > 0 || e.Settings.TicketsFilter.eTicket == true || e.Settings.TicketsFilter.Quantity > 0)
		},
		IsTicketFiltered: function(f) {
			if (e.Settings.TicketsFilter.MinPrice > 0 && f.PriceValue > 0 && f.PriceValue < e.Settings.TicketsFilter.MinPrice) {
				return false
			}
			if (e.Settings.TicketsFilter.MaxPrice > 0 && f.PriceValue > 0 && f.PriceValue > e.Settings.TicketsFilter.MaxPrice) {
				return false
			}
			if (e.Settings.TicketsFilter.eTicket && e.eTicketFlag && !f.eticket) {
				return false
			}
			if (e.Settings.TicketsFilter.Quantity > 0) {
				if (e.Settings.TicketsFilter.Comparison == "eq") {
					if (typeof(f.quantity) == "object") {
						if (c.inArray(e.Settings.TicketsFilter.Quantity, f.quantity) == -1) {
							return false
						}
					} else {
						if (f.MaxQuantity > 0 && f.MaxQuantity != e.Settings.TicketsFilter.Quantity) {
							return false
						}
					}
				} else {
					if (e.Settings.TicketsFilter.Comparison == "gt" && f.MaxQuantity > 0 && f.MaxQuantity < e.Settings.TicketsFilter.Quantity) {
						return false
					} else {
						if (e.Settings.TicketsFilter.Comparison == "bt") {
							if (typeof(f.quantity) == "object") {
								if (c.inArray(e.Settings.TicketsFilter.Quantity, f.quantity) == -1) {
									return false
								}
								if (c.inArray(e.Settings.TicketsFilter.MaxQuantity, f.quantity) == -1) {
									return false
								}
							} else {
								if ((f.quantity < e.Settings.TicketsFilter.MaxQuantity) || (f.MaxQuantity > 0 && f.MaxQuantity > e.Settings.TicketsFilter.MaxQuantity)) {
									return false
								}
							}
						}
					}
				}
			}
			return true
		},
		ShowTickets: function() {
			if (e.Settings.TicketsListContainer == null) {
				if (e.Settings.RowSelector != null) {
					c(e.Settings.RowSelector).hide();
					c.each(e.FilteredTickets, function(h, g) {
						g.RowObject.show()
					})
				}
				return
			}
			var f = 0;
			b.Initialize({
				Container: e.vTableContainer,
				Rows: e.FilteredTickets.length,
				TableFormatter: function(g) {
					return g
				},
				ColumnsFormatter: function(g) {
					if (!e.Settings.DisplayListHeader) {
						return g.css("display", "none")
					}
					c.each(e.Settings.Columns, function(h, i) {
						if (i.Visible == null || i.Visible) {
							f++;
							var j = c("<th>");
							if (i.Sortable) {
								j.addClass("Sort" + (h == e.Settings.TicketsSort.Column ? " " + e.Settings.TicketsSort.Order : ""))
							}
							if (i.Width) {
								j.css("width", i.Width + "px")
							}
							j.attr("lang", h).html(i.Title).append("<span>");
							j.click(function() {
								if (c(this).hasClass("Sort")) {
									var k = "";
									if (c(this).hasClass("ASC")) {
										k = "DESC"
									} else {
										k = "ASC"
									}
									e.Settings.TicketsSort = {
										Column: h,
										Order: k
									};
									e.SortTickets();
									e.ShowTickets()
								}
							});
							g.append(j)
						}
					});
					return g
				},
				RowFormatter: function(h, i) {
					var g = e.FilteredTickets[i];
					h.addClass((i % 2 == 0 ? "EvenRow" : "OddRow"));
					c.each(e.Settings.Columns, function(j, k) {
						if (k.Visible == null || k.Visible) {
							var l = c("<td>");
							if (k.CSSClass) {
								l.addClass(k.CSSClass)
							}
							if (k.Align) {
								l.css("text-align", k.Align)
							}
							l.html((k.Formatter ? k.Formatter(g, j, g[j]) : g[j]));
							h.append(l);
							l.children(".BuyLink").click(function() {
								var n = c(this).attr("lang");
								var m = 0;
								h.children("td").each(function() {
									var o = c(this).children("[lang=Quantity]");
									if (o.length > 0) {
										m = c(o[0]).val();
										return false
									}
								});
								e.Container.trigger("OnTicketSelected", {
									Id: n,
									Quantity: m
								})
							});
							l.children(".Notes").hover(function(o) {
								var m = c.trim(c(this).attr("title"));
								if (m != "") {
									var n = c(this).position();
									e.Tooltip.css({
										top: n.top + 20,
										left: n.left + 20
									}).html(m);
									e.Tooltip.show();
									c(this).attr("title", "")
								}
							}, function() {
								c(this).attr("title", e.Tooltip.html());
								e.Tooltip.hide()
							})
						}
					});
					h.hover(function() {
						e.HighlightSection(g.SectionKey, true)
					}, function() {
						e.ResetSection(g.SectionKey, true)
					});
					return h
				},
				NoResultsFormatter: function(g) {
					return g.append(c("<td>").attr("colspan", f).html(e.Settings.NoResultsFormatter()))
				}
			})
		},
		ShowTooltip: function(j, i, l) {
			if (e.TooltipTimeout) {
				clearTimeout(e.TooltipTimeout);
				e.TooltipTimeout = null
			}
			if (!l) {
				j = e.GetSectionKey(j)
			}
			var k = e.Sections[j];
			if (!e.Settings.AlwaysShowTooltip && (!k.Active || k.Quantity == 0)) {
				e.HideTooltip();
				return
			}
			var g = e.Settings.TooltipFormatter({
				Key: k.Key,
				Section: k.Name,
				DisplayName: (k.DisplayName != null ? k.DisplayName : k.Name),
				Mappings: k.Mappings,
				DisplayGroupName: k.DisplayGroupName,
				SectionViewThumbnailUrl: k.SectionViewThumbnailUrl,
				SectionViewUrl: k.SectionViewUrl,
				Group: e.Groups[k.GroupId],
				Active: k.Active,
				Quantity: k.Quantity,
				MinPrice: k.MinPriceValue,
				MaxPrice: k.MaxPriceValue
			});
			e.Tooltip.html(g);
			if (e.Settings.EnableTooltipSectionView) {
				var f = function(m) {
					e.Tooltip.animate({
						left: "-=" + ((e.SectionViewSize - e.Settings.TooltipSectionViewSize) / 2)
					}, "fast");
					m.parent().animate({
						width: e.SectionViewSize
					}, "fast").unbind().mouseout(function() {
						e.HideTooltip()
					});
					m.animate({
						height: Math.round(e.SectionViewSize / 2)
					}, "fast");
					m.attr("src", k.SectionViewUrl);
					e.Tooltip.children("div:first").children(".SectionViewZoom").remove();
					m.unbind();
					m.css("cursor", "auto")
				};
				var h = (c.browser.webkit ? "-webkit-zoom-in" : (c.browser.mozilla ? "-moz-zoom-in" : "pointer"));
				c(e.Tooltip.children("div:first").children("img")[0]).css("cursor", h).click(function(m) {
					f(c(this))
				});
				c(e.Tooltip.children("div:first").children(".SectionViewZoom")[0]).css("cursor", h).click(function(m) {
					f(c(e.Tooltip.children("div:first").children("img")[0]))
				});
				e.Tooltip.mouseover(function() {
					d.MouseOnTooltip = true
				}).mouseout(function() {
					d.MouseOnTooltip = false
				})
			}
			e.MoveTooltip(k, i);
			g = c.trim(g);
			if (g == "") {
				return
			}
			e.Tooltip.show()
		},
		MoveTooltip: function(j, h) {
			var f = "BottomRight";
			var i = j.GetCorner(h, f);
			var g = e.Container.position();
			i.x += g.left;
			i.y += g.top;
			if (i.x + e.Tooltip.width() > g.left + e.Container.width()) {
				f = "BottomLeft";
				i = j.GetCorner(h, f);
				i.y += g.top;
				i.x = g.left + i.x - e.Tooltip.width() - 10
			}
			if (i.y + e.Tooltip.height() > g.top + e.Container.height()) {
				if (f == "BottomLeft") {
					f = "TopLeft"
				} else {
					f = "TopRight"
				}
				i = j.GetCorner(h, f);
				if (f == "TopRight") {
					i.x += g.left
				} else {
					i.x = g.left + i.x - e.Tooltip.width() - 10
				}
				i.y = g.top + i.y - e.Tooltip.height() - 10
			}
			e.Tooltip.stop();
			e.Tooltip.animate({
				top: i.y,
				left: i.x
			})
		},
		HideTooltip: function(g) {
			if (e.TooltipTimeout) {
				return
			}
			var f = function() {
				if (d.MouseOnTooltip) {
					return
				}
				e.Tooltip.unbind();
				e.Tooltip.hide();
				if (!g) {
					e.HideSectionView("mouseover")
				}
			};
			e.TooltipTimeout = setTimeout(f, 500)
		},
		ShowSectionView: function(k, f) {
			if (e.Settings.SectionViewContainer && e.Settings.SectionViewTrigger == f) {
				var j = e.Sections[k];
				if (!j.SectionViewUrl) {
					e.HideSectionView(f);
					return
				}
				var h = e.Groups[j.GroupId];
				var i = "Approximate View from " + (j.DisplayGroupName ? (h.DisplayName != null ? h.DisplayName : h.Name) + " " : "") + (j.DisplayName != null ? j.DisplayName : j.Name);
				var g = c("<div>");
				if (f == "click") {
					g.addClass("tuMapSectionViewContainer");
					var i = c("<div>").html(i).append(c("<div>").addClass("CloseButton").click(function() {
						e.HideSectionView(f)
					}));
					g.append(i)
				}
				g.append('<img src="' + j.SectionViewUrl + '" alt="' + i + '" style="max-width:100%;"/>');
				c(e.Settings.SectionViewContainer).html(g);
				c(e.Settings.SectionViewContainer).show()
			}
		},
		HideSectionView: function(f) {
			if (e.Settings.SectionViewContainer && e.Settings.SectionViewTrigger == f) {
				c(e.Settings.SectionViewContainer).html("");
				c(e.Settings.SectionViewContainer).hide()
			}
		},
		InitSection: function(g, f) {
			if (e.Groups[g.GroupId].SectionCount == 1) {
				g.Key = g.GroupId
			} else {
				g.Key = g.Name.toLowerCase() + "_" + g.GroupId
			} if (!e.SectionCounts[g.Name.toLowerCase()]) {
				e.SectionCounts[g.Name.toLowerCase()] = 0
			}
			e.SectionCounts[g.Name.toLowerCase()]++;
			if (g.IsSectionViewAvailable) {
				g.IsSectionViewAvailable = f != null
			}
			g.Active = (e.Settings.TicketsListContainer == null && e.Settings.RowSelector == null);
			if (g.IsSectionViewAvailable) {
				g.SectionViewThumbnailUrl = f + e.Settings.TooltipSectionViewSize + "X/" + g.Key + ".jpg";
				g.SectionViewUrl = f + e.SectionViewSize + "X/" + g.Key + ".jpg"
			}
			d.Add(new a.Map.Section(g))
		},
		Refresh: function(f) {
			if (f != null) {
				e.RefreshType = f
			}
			switch (e.RefreshType) {
				case "Reset":
					c.each(e.Settings.Tickets, function(g, h) {
						h.SectionKey = null
					});
					c.extend(e.Settings, e.GetStyles(e.Settings.ColorScheme));
					c(this).tuMap(e.Settings);
					break;
				case "ProcessTickets":
					e.ProcessTickets();
					e.SortTickets();
					e.ShowTickets();
					break;
				case "SortTickets":
					e.SortTickets();
					e.ShowTickets();
					break;
				case "ShowTickets":
					e.ShowTickets();
					break
			}
			return this
		},
		GenerateGroups: function() {
			var j = "";
			c.each(e.Groups, function(o, n) {
				j += '<div lang="' + n.Id + '" class="tuMapGroup ' + (n.ActiveSections == 0 ? "Disabled" : "") + " " + (n.Selected ? "tuMapGroupChecked" : "") + '">';
				j += '<span class="tuMapGroupColor" style="background-color:' + n.Color + ';"></span>';
				j += '<span class="tuMapGroupTitle">' + n.Name + "</span>";
				j += '<br style="clear:both"/>';
				j += "</div>"
			});
			c(e.Settings.GroupsContainer).html(j).addClass("tuMapGroupsContainer");
			var m = 0;
			c(e.Settings.GroupsContainer).children(".tuMapGroup").each(function() {
				if (c(this).outerWidth() > m) {
					m = Math.round(c(this).outerWidth())
				}
			});
			if (!e.InteractiveMode) {
				c(e.Settings.GroupsContainer).removeClass("tuMapActiveGroupsContainer")
			} else {
				c(e.Settings.GroupsContainer).addClass("tuMapActiveGroupsContainer");
				c(e.Settings.GroupsContainer).children("div").hover(function() {
					if (c(this).hasClass("Disabled")) {
						var n = c(this).position();
						e.Tooltip.html("No Inventory Available").css({
							top: n.top - e.Tooltip.height(),
							left: n.left - e.Tooltip.width()
						});
						e.Tooltip.show()
					} else {
						e.HighlightGroup(c(this).attr("lang"))
					}
				}, function() {
					if (c(this).hasClass("Disabled")) {
						e.Tooltip.hide()
					} else {
						e.ResetGroup(c(this).attr("lang"))
					}
				}).click(function() {
					if (c(this).hasClass("Disabled")) {
						return
					}
					var n = c(this).attr("lang");
					var q = e.Groups[n].Selected;
					if (q) {
						e.Groups[n].Selected = false
					} else {
						e.Groups[n].Selected = true
					}
					var p = [];
					e.GetSectionsInGroup(n, {
						OnlyActive: true,
						OnlyUnselected: false
					}, function(r, s) {
						p.push({
							Name: s.Name,
							Active: s.Active
						});
						e.Sections[r].Selected = q;
						e.ToggleSelection(r, true, true)
					});
					e.ProcessTickets();
					e.SortTickets();
					e.ShowTickets();
					var o = e.Groups[n];
					e.Container.trigger("OnGroupClick", {
						Name: o.Name,
						Selected: o.Selected,
						Sections: p
					})
				})
			}
			var f = c(e.Settings.GroupsContainer).width();
			var l = c(e.Settings.GroupsContainer + " > DIV").length;
			var h = parseInt(f / m);
			var k = parseInt(l / h) + (l % h > 0 ? 1 : 0);
			while (true) {
				var g = parseInt(l / (h - 1)) + (l % (h - 1) > 0 ? 1 : 0);
				if (g <= k) {
					h--
				} else {
					break
				}
			}
			m = Math.floor(f / h);
			var i = 0;
			c(e.Settings.GroupsContainer + " .tuMapGroup").each(function() {
				if (i == 0) {
					c(e.Settings.GroupsContainer).append(c("<div>").addClass("TempContainer").css("width", m))
				}
				c(e.Settings.GroupsContainer + " > .TempContainer:last").append(c(this));
				i++;
				if (i == k) {
					i = 0
				}
			});
			c(e.Settings.GroupsContainer + " > .TempContainer").removeClass("TempContainer");
			c(e.Settings.GroupsContainer).append('<br style="clear:both;"/>')
		},
		OnLoad: function(f, h) {
			try {
				if (h.Status == 1) {
					d.GetTile = function(p, n, m) {
						var o = "";
						switch (e.Settings.ColorScheme) {
							case 1:
								o = "WB/";
								break;
							case 2:
								if (h.MapType == "Interactive") {
									o = "CL/"
								}
								break
						}
						var l = m.createElement("IMG");
						l.src = h.MapBaseUrl + h.VenueChartId + "/" + o + n + "_" + p.x + "_" + p.y + ".jpg";
						l.onerror = function() {
							if (e.Settings.ColorScheme != 0) {
								this.src = h.MapBaseUrl + h.VenueChartId + "/" + n + "_" + p.x + "_" + p.y + ".jpg"
							}
						};
						return l
					};
					d.ZoomLevel = e.Settings.ZoomLevel;
					d.Initialize(c(this));
					if (h.Groups && h.Groups.length > 0) {
						c.each(h.Groups, function(m, l) {
							l.ActiveSections = 0;
							e.Groups[l.Id] = l
						})
					}
					if (h.Sections != null) {
						var g = (h.SectionViewBaseUrl ? h.SectionViewBaseUrl + h.VenueChartId + "/" : null);
						e.SectionViewSize = 500;
						if (e.Settings.SectionViewContainer) {
							e.SectionViewSize = e.CalculateSVWidth(c(e.Settings.SectionViewContainer).width())
						} else {
							e.Settings.TooltipSectionViewSize = e.CalculateSVWidth(e.Settings.TooltipSectionViewSize);
							e.SectionViewSize = e.CalculateSVWidth(e.Settings.TooltipSectionViewSize * 2)
						}
						e.SectionCounts = {};
						e.Sections = {};
						c.each(h.Sections, function(m, l) {
							e.InitSection(l, g)
						});
						var k = function() {
							d.SetZoom(e.Settings.ZoomLevel)
						};
						var i = 1;
						if (d.IsOldIE()) {
							i = 1000
						}
						setTimeout(k, i)
					}
					e.OtherSections = {};
					if (h.OtherSections != null) {
						c.each(h.OtherSections, function(m, l) {
							e.OtherSections[l.Name] = l;
							e.OtherSections[l.Name].Enabled = false;
							e.OtherSections[l.Name].Mappings = []
						})
					}
					e.OtherSections.Unmapped = {
						Name: "Unmapped",
						Alias: [],
						IsExactMatch: false,
						Enabled: false,
						Mappings: []
					}
				} else {
					if (e.Settings.FailoverMapUrl) {
						e.Container.html('<center><img src="' + e.Settings.FailoverMapUrl + '" alt="Venue Map" style="max-width:' + e.Container.width() + 'px"/></center>')
					}
				}
				e.InteractiveMode = h.MapType == "Interactive";
				e.ProcessTickets();
				e.SortTickets();
				if (e.InteractiveMode) {
					c.each(e.OtherSections, function(l, m) {
						if (m.Enabled) {
							d.AddMapControl(m.Name, function(n) {
								e.FilterTickets(l, n, true);
								e.Container.trigger("OnControlClick", {
									Name: m.Name,
									Selected: n,
									Mappings: m.Mappings
								})
							}, true)
						}
					})
				}
				e.GenerateFilters();
				e.ShowTickets();
				if (h.Status == 1) {
					e.Container.trigger("OnInit", h.MapType)
				} else {
					e.Container.trigger("OnError", {
						Code: h.ErrorCode,
						Message: h.Error
					});
					e.MapError = true
				}
			} catch (j) {
				e.Container.trigger("OnError", {
					Code: -1,
					Message: j.message
				});
				e.MapError = true;
				throw j
			}
		},
		CalculateSVWidth: function(h) {
			var g = [250, 500, 1000, 1500];
			if (h <= g[0]) {
				return g[0]
			} else {
				for (var f = 0; f < 4; f++) {
					if (f == g.length - 1) {
						return g[g.length - 1]
					} else {
						if (h >= g[f] && h < g[f + 1]) {
							return (h - g[f] < g[f + 1] - h ? g[f] : g[f + 1])
						}
					}
				}
			}
		},
		GenerateFilters: function() {
			if (e.Settings.TicketsListContainer) {
				c(e.Settings.TicketsListContainer).css("overflow", "visible");
				c(e.Settings.TicketsListContainer).html("");
				var g = c(e.Settings.TicketsListContainer).height();
				var i = 0;
				if (e.PreferredFlag || e.eTicketFlag) {
					var h = c("<div>").addClass("tuMapPreferredFilter");
					if (e.PreferredFlag) {
						h.append(c("<div>").addClass("tuMapPreferred"));
						var f = c("<input>").attr("type", "checkbox").attr("checked", (e.Settings.PreferredFirst ? 'checked="checked"' : ""));
						f.change(function(j) {
							e.Settings.PreferredFirst = c(this).is(":checked");
							e.SortTickets();
							e.ShowTickets()
						});
						h.append(c("<div>").append(f));
						h.append(c("<div>").html(e.Settings.PreferredText))
					}
					if (e.eTicketFlag) {
						h.append(c("<div>").addClass("tuMapeTicket").css("margin-left", "20px"));
						h.append(c("<div>").css("padding-left", "5px").html("E-Ticket"))
					}
					c(e.Settings.TicketsListContainer).append(h);
					c("<br>").css("clear", "both").insertAfter(h);
					if (g == 0) {
						i = c(e.Settings.TicketsListContainer).height()
					}
				}
				e.vTableContainer = c("<div>");
				c(e.Settings.TicketsListContainer).append(e.vTableContainer);
				if (g == 0) {
					g = e.Container.height();
					if (e.Settings.GroupsContainer) {
						g += c(e.Settings.GroupsContainer).height()
					}
					g = g - Math.abs(e.Container.offset().top - c(e.vTableContainer).offset().top)
				}
				g = g - i;
				e.vTableContainer.height(g)
			}
		},
		Extend: function(f) {
			c.extend(true, e, f);
			return this
		},
		GetStyles: function(f) {
			switch (f) {
				case 0:
					return {
						HighlightStyle: {
							strokeColor: "#FFFFFF",
							strokeWeight: 2,
							fillColor: "#0000FF",
							fillOpacity: 0.2
						},
						NormalStyle: {
							fillOpacity: 0,
							fillColor: "#FFFFFF",
							strokeColor: "#FFFFFF",
							strokeWeight: 0
						},
						SelectedStyle: {
							strokeWeight: 2,
							fillColor: "#FFFFFF",
							fillOpacity: 0.3
						},
						InactiveStyle: {
							strokeColor: "#FFFFFF",
							strokeWeight: 0,
							fillColor: "#666666",
							fillOpacity: 0.7
						}
					};
					break;
				case 1:
					return {
						HighlightStyle: {
							strokeColor: "#333333",
							strokeWeight: 2,
							fillColor: "#FFFF00",
							fillOpacity: 0.5
						},
						NormalStyle: {
							fillOpacity: 0,
							fillColor: "#FFFFFF",
							strokeColor: "#FFFFFF",
							strokeWeight: 0
						},
						SelectedStyle: {
							strokeWeight: 2,
							fillColor: "#FFFFFF",
							fillOpacity: 0.3
						},
						InactiveStyle: {
							strokeColor: "#FFFFFF",
							strokeWeight: 0,
							fillColor: "#666666",
							fillOpacity: 0.7
						}
					};
					break;
				case 2:
					return {
						HighlightStyle: {
							strokeColor: "#EAEAEA",
							strokeWeight: 2,
							fillColor: "#0000FF",
							fillOpacity: 0.3
						},
						NormalStyle: {
							fillOpacity: 0.5,
							fillColor: "#D4A017",
							strokeColor: "#FFFFFF",
							strokeWeight: 2
						},
						SelectedStyle: {
							strokeWeight: 2,
							fillColor: "#FFFFFF",
							fillOpacity: 0.3
						},
						InactiveStyle: {
							strokeColor: "#FFFFFF",
							strokeWeight: 2,
							fillColor: "#8E35EF",
							fillOpacity: 0.2
						}
					};
					break
			}
		},
		Initialize: function(g) {
			e.Groups = {};
			e.Sections = {};
			e.OtherSections = {};
			e.Selection = [];
			e.RefreshType = "None";
			if (g.ColorScheme != null) {
				c.extend(e.defaults, e.GetStyles(g.ColorScheme))
			}
			e.Settings = c.extend({}, e.defaults, g);
			e.Container = c(this);
			e.Container.unbind();
			c(".tuMapTooltip").remove();
			var f = e.Container.position();
			e.Tooltip = c('<div class="tuMapTooltip"></div>').insertAfter(e.Container).css({
				position: "absolute",
				display: "none",
				"z-index": 20000,
				left: f.left,
				top: f.top
			});
			e.Container.bind("OnTicketSelected", e.Settings.OnTicketSelected);
			e.Container.bind("OnMouseover", e.Settings.OnMouseover);
			e.Container.bind("OnMouseout", e.Settings.OnMouseout);
			e.Container.bind("OnClick", e.Settings.OnClick);
			e.Container.bind("OnGroupClick", e.Settings.OnGroupClick);
			e.Container.bind("OnLoad", e.OnLoad);
			e.Container.bind("OnInit", e.Settings.OnInit);
			e.Container.bind("OnError", e.Settings.OnError);
			e.Container.bind("OnReset", e.Settings.OnReset);
			e.Container.bind("OnControlClick", e.Settings.OnControlClick);
			var h = "Version=2.1.1&MapSet=" + e.Settings.MapSet + "&MapType=" + e.Settings.MapType + "&EnableGroups=" + (e.Settings.GroupsContainer != null).toString() + "&Domain=" + window.location.host + "&AutoSwitchToStatic=" + e.Settings.AutoSwitchToStatic;
			if (e.Settings.MapId == null && e.Settings.EventId == null) {
				throw ("MapId or EventId Required")
			} else {
				if (e.Settings.EventId != null) {
					h = "EventId=" + e.Settings.EventId + "&SeatingChartAutoCorrect=" + e.Settings.SeatingChartAutoCorrect + "&" + h
				}
				if (e.Settings.MapId != null) {
					h = "MapId=" + e.Settings.MapId + "&" + h
				}
			}
			console.log(e.Settings.ServiceUrl);
			console.log(h);
			c.ajax({
				url: e.Settings.ServiceUrl,
				dataType: "jsonp",
				crossDomain: true,
				data: h,
				type: "POST",
				success: function(i) {
					console.log(i);
					if (e.Settings.GroupsContainer != null) {
						c(e.Settings.GroupsContainer).html("")
					}
					if (e.Settings.TicketsListContainer != null) {
						c(e.Settings.TicketsListContainer).html("")
					}
					e.Container.html("");
					e.Container.trigger("OnLoad", i)
				},
				error: function(k, i, j) {}
			});
			return this
		}
	};
	var b = {
		defaults: {
			Rows: 0,
			TableFormatter: function(f) {
				return f
			},
			ColumnsFormatter: function(f) {
				return f.append(c("<th>").text("Column"))
			},
			RowFormatter: function(g, f) {
				return g.attr("lang", f).append(c("<td>").text("Row" + f))
			},
			NoResultsFormatter: function(f) {}
		},
		Initialize: function(h) {
			b.Body = null;
			b.Fillers = [];
			b.RowData = [];
			b.RowHeight = 0;
			b.Settings = c.extend({}, b.defaults, h);
			b.Settings.Container.unbind();
			b.Settings.Container.html("").attr("class", "tuMapTicketList");
			b.ColTable = b.Settings.TableFormatter(c("<table>").attr("cellpadding", 3).attr("cellspacing", 0).attr("style", "width:100%;"));
			b.ColTable.append(c("<thead>").append(b.Settings.ColumnsFormatter(c("<tr>"))));
			b.ColTable.appendTo(b.Settings.Container);
			b.TableContainer = c("<div>").css("overflow", "auto").css("height", b.Settings.Container.height() - b.ColTable.height() - 1);
			b.TableContainer.appendTo(b.Settings.Container);
			b.Table = b.ColTable.clone();
			b.Body = b.Table.append("<tbody>");
			b.Table.appendTo(b.TableContainer);
			if (b.Settings.Rows == 0) {
				b.Body.append(b.Settings.NoResultsFormatter(c("<tr>")));
				b.AdjustColumns();
				return
			}
			for (var f = 0; f < b.Settings.Rows; f++) {
				b.RowData[f] = {
					Created: true,
					tr: c("<tr>")
				};
				b.Body.append(b.Settings.RowFormatter(b.RowData[f].tr, f));
				if (b.Table.height() > b.TableContainer.height()) {
					b.RowHeight = (b.Table.height() / f);
					var g = c("<tr>").attr("height", b.Settings.Rows * b.RowHeight);
					b.Body.append(g);
					b.Fillers.push({
						startIndex: f + 1,
						endIndex: b.Settings.Rows - 1,
						tr: g
					});
					b.CreateRow(0, f);
					break
				}
			}
			b.AdjustColumns();
			b.TableContainer.scroll(function() {
				var i = c(this).scrollTop();
				if (b.scrollTop != i) {
					if (b.verticalScrollHandle != null) {
						clearTimeout(b.verticalScrollHandle)
					}
					b.verticalScrollHandle = setTimeout(function() {
						b.RenderRows()
					}, 10);
					b.scrollTop = i
				}
			})
		},
		CreateRow: function(t, o) {
			var v = b.RowData;
			for (var n = t; n <= o; n++) {
				if (v[n] == null) {
					v[n] = {}
				}
			}
			var g = false;
			for (var n = t; n <= o; n++) {
				if (v[n].tr == null) {
					g = true;
					break
				}
			}
			if (!g) {
				return
			}
			var u = b.Body;
			var f = b.RowHeight;
			var h = b.Fillers;
			var j = [];
			for (var n = h.length; n--;) {
				var m = h[n];
				if (t <= m.endIndex && o >= m.startIndex) {
					j.push(m)
				}
			}
			for (var n = j.length; n--;) {
				var m = j[n];
				var p = t >= m.startIndex ? t : m.startIndex;
				var s = o <= m.endIndex ? o : m.endIndex;
				for (var q = p; q <= s; q++) {
					var r = v[q];
					r.tr = c("<tr>").height(f + "px").insertBefore(m.tr)
				}
				var l = false;
				var k = m.startIndex;
				if (s < m.endIndex) {
					m.startIndex = s + 1;
					m.tr.height(((m.endIndex - m.startIndex + 1) * f) + "px");
					l = true
				}
				if (p > k) {
					if (l) {
						var m = {
							startIndex: k,
							endIndex: p - 1,
							tr: c("<tr>")
						};
						m.tr.height(((m.endIndex - m.startIndex + 1) * f) + "px").insertBefore(v[p].tr);
						h.push(m)
					} else {
						m.endIndex = p - 1;
						m.tr.height(((m.endIndex - m.startIndex + 1) * f) + "px").insertBefore(v[p].tr);
						l = true
					}
				}
				if (!l) {
					for (var q = h.length; q--;) {
						if (m == h[q]) {
							h.splice(q, 0);
							break
						}
					}
					m.tr.remove()
				}
			}
		},
		RenderRows: function() {
			if (b.Settings.Rows == 0) {
				return
			}
			var g = Math.floor(b.TableContainer.scrollTop() / b.RowHeight) - 5;
			var j = Math.ceil((b.TableContainer.scrollTop() + b.TableContainer.height()) / b.RowHeight) + 5;
			if (g < 0) {
				g = 0
			}
			if (j > b.Settings.Rows - 1) {
				j = b.Settings.Rows - 1
			}
			b.CreateRow(g, j);
			for (var f = g; f <= j; f++) {
				var h = b.RowData[f];
				if (h.Created !== true) {
					b.Settings.RowFormatter(h.tr, f);
					h.Created = true
				}
			}
			b.AdjustColumns()
		},
		AdjustColumns: function() {
			var h = b.Table.find("tr:first").children();
			var g = b.ColTable.find("tr:first").children();
			for (var f = 0; f < h.length - 1; f++) {
				c(g[f]).width(c(h[f]).width())
			}
			b.Table.css("margin-top", -c(h[0]).outerHeight() - 1)
		}
	};
	var d = {
		TileSize: 500,
		OnMouseOver: function(f, g, h) {
			if (h.Active && !h.Selected) {
				h.SetStyle(e.Settings.HighlightStyle)
			}
			if (g) {
				e.ShowTooltip(h.Key, g, true)
			}
			e.Container.trigger("OnMouseover", {
				Active: h.Active,
				Selected: h.Selected,
				Key: h.Key,
				Name: h.Name,
				DisplayName: h.DisplayName,
				DisplayGroupName: h.DisplayGroupName,
				ExactMatchAlias: h.ExactMatchAlias,
				Alias: h.Alias,
				Group: e.Groups[h.GroupId],
				SectionViewAvailable: h.IsSectionViewAvailable,
				SectionViewThumbnailUrl: h.SectionViewThumbnailUrl,
				SectionViewUrl: h.SectionViewUrl,
				Mappings: h.Mappings,
				MousePosition: g
			})
		},
		OnMouseOut: function(f, g, h) {
			if (h.Active && !h.Selected) {
				h.SetStyle(e.Settings.NormalStyle)
			}
			if (g) {
				e.HideTooltip()
			}
			e.Container.trigger("OnMouseout", {
				Active: h.Active,
				Selected: h.Selected,
				Key: h.Key,
				Name: h.Name,
				DisplayName: h.DisplayName,
				DisplayGroupName: h.DisplayGroupName,
				ExactMatchAlias: h.ExactMatchAlias,
				Alias: h.Alias,
				Group: e.Groups[h.GroupId],
				SectionViewAvailable: h.IsSectionViewAvailable,
				SectionViewThumbnailUrl: h.SectionViewThumbnailUrl,
				SectionViewUrl: h.SectionViewUrl,
				Mappings: h.Mappings,
				MousePosition: g
			})
		},
		OnMouseMove: function(f, g, h) {},
		OnClick: function(f, g, h) {
			e.HideTooltip(true);
			if (h && h.Active) {
				e.ToggleSelection(h.Key, true);
				e.Container.trigger("OnClick", {
					Active: h.Active,
					Selected: h.Selected,
					Key: h.Key,
					Name: h.Name,
					DisplayName: h.DisplayName,
					DisplayGroupName: h.DisplayGroupName,
					ExactMatchAlias: h.ExactMatchAlias,
					Alias: h.Alias,
					Group: e.Groups[h.GroupId],
					SectionViewAvailable: h.IsSectionViewAvailable,
					SectionViewThumbnailUrl: h.SectionViewThumbnailUrl,
					SectionViewUrl: h.SectionViewUrl,
					Mappings: h.Mappings
				})
			}
		},
		OnReset: function() {
			c.each(e.Selection, function(g, f) {
				if (e.Sections[f]) {
					e.Sections[f].Selected = false
				}
			});
			e.Selection = [];
			c.each(e.Groups, function(f, g) {
				e.Groups[f].Selected = false
			});
			c(".tuMapControlSelected").each(function() {
				c(this).removeClass("tuMapControlSelected")
			});
			d.SetCenter(new a.Map.Point(0, 0));
			d.SetZoom(e.Settings.ZoomLevel);
			e.ProcessTickets();
			e.SortTickets();
			e.ShowTickets();
			e.Container.trigger("OnReset")
		},
		GetTile: function() {},
		Container: null,
		Wrapper: null,
		Canvas: null,
		GCanvas: null,
		CanvasContext: null,
		GCanvasContext: null,
		GhostSections: {},
		CurrentShape: null,
		TranslatePos: null,
		StartDragOffset: {},
		BaseUrl: "http://data.ticketutils.com/Charts/",
		ZoomLevel: 1,
		Side: 500,
		Tiles: [],
		IsOldIE: function() {
			return c.browser.msie && parseInt(c.browser.version, 10) < 9
		},
		Initialize: function(h) {
			var l = h.height();
			var g = h.width();
			if (g == 0 || l == 0) {
				var k = h.clone().css("postion", "absolute").css("display", "block").css("left", "-1000").css("top", "-1000");
				c("body").append(k);
				g = k.width();
				l = k.height();
				k.remove();
				if (g == 0 || l == 0) {
					l = d.Side * d.ZoomLevel;
					g = l
				}
			}
			d.Container = c("<div>").attr("class", "tuMapContainer").attr("style", "position:relative;margin:auto;overflow:hidden;width:" + g + "px;height:" + l + "px").appendTo(h).disableSelection().mousemove(function(m) {
				if (d.MouseDown) {
					if (d.CurrentShape) {
						d.Wrapper.trigger("OnMouseOut", [d.GetAbsolutePosition(m), d.CurrentShape])
					}
					c(d.Canvas).css("cursor", "move");
					d.CurrentShape = null;
					d.TranslatePos.x = m.clientX - d.StartDragOffset.x;
					d.TranslatePos.y = m.clientY - d.StartDragOffset.y;
					d.Translate();
					d.Dragging = true;
					return
				}
			});
			d.TranslatePos = new a.Map.Point(0, 0);
			d.Side = d.TileSize * d.ZoomLevel;
			d.Wrapper = c("<div>").attr("style", "z-index:0;position:absolute;width:" + d.Side + "px;height:" + d.Side + "px").disableSelection().appendTo(d.Container).mousedown(function(m) {
				d.MouseDown = true;
				d.StartDragOffset.x = m.clientX - d.TranslatePos.x;
				d.StartDragOffset.y = m.clientY - d.TranslatePos.y
			}).mouseup(function(m) {
				d.MouseDown = false;
				d.Dragging = false;
				c(d.Canvas).css("cursor", "auto")
			}).mouseover(function(m) {
				d.MouseDown = false;
				d.Dragging = false
			}).mouseout(function(m) {
				d.MouseDown = false;
				d.Dragging = false;
				return false
			});
			d.GenerateTiles();
			var f = c("<canvas />").attr("style", "position:absolute; top:0; left:0; z-index:1").disableSelection().appendTo(d.Wrapper);
			d.Canvas = f[0];
			d.Canvas.width = d.Wrapper.width();
			d.Canvas.height = d.Wrapper.height();
			d.Canvas.onselectstart = function() {
				return false
			};
			if (window.G_vmlCanvasManager) {
				G_vmlCanvasManager.initElement(d.Canvas)
			}
			d.CanvasContext = d.Canvas.getContext("2d");
			if (!d.IsOldIE()) {
				var i = c("<canvas />");
				d.GCanvas = i[0];
				d.GCanvas.width = d.Wrapper.width();
				d.GCanvas.height = d.Wrapper.height();
				if (window.G_vmlCanvasManager) {
					G_vmlCanvasManager.initElement(d.GCanvas)
				}
				d.GCanvasContext = d.GCanvas.getContext("2d")
			}
			d.ZoomControls = c("<div>").addClass("ZoomControls").appendTo(d.Container);
			c("<div>").addClass("ZoomIn").appendTo(d.ZoomControls).click(function() {
				d.ZoomIn()
			});
			c("<div>").addClass("ZoomOut").appendTo(d.ZoomControls).click(function() {
				d.ZoomOut()
			});
			d.ResetContainer = c("<div>").attr("style", "position:absolute;right:5px;top:5px;").appendTo(d.Container);
			d.ResetButton = c("<div>").addClass("tuMapControl").html(e.Settings.ResetButtonText).appendTo(d.ResetContainer).click(function() {
				e.HideSectionView("click");
				d.Wrapper.trigger("OnReset")
			});
			c(".tuMapControlsContainer").remove();
			if (e.Settings.ControlsPosition == "Inside") {
				d.ControlsContainer = c('<div class="tuMapControlsContainer">').attr("style", "text-align:center;bottom:0;left:50%;position:absolute;").appendTo(d.Container)
			} else {
				d.ControlsContainer = c('<div class="tuMapControlsContainer">').attr("style", "text-align:center;margin:0 auto;").insertAfter(h)
			} if (d.IsOldIE()) {
				d.CallbackFunctionId = "TMCB" + Math.floor(Math.random() * 1000000) + 1000;
				window[d.CallbackFunctionId] = function(r, q, n, m) {
					var p = d.Wrapper.offset();
					var o = {
						x: r.x,
						y: r.y
					};
					if (n == "out") {
						d.TriggerEvent(o, null)
					} else {
						if (n == "click") {
							d.Wrapper.trigger("OnClick", [o, d.CurrentShape])
						} else {
							d.TriggerEvent(o, m)
						}
					}
				}
			}
			var j = function(p) {
				if (!d.Dragging) {
					var o = d.GetAbsolutePosition(p);
					var n = d.GetSectionUnderMouse(p);
					if (n) {
						var m = e.Sections[n];
						if (m) {
							d.Wrapper.trigger("OnClick", [o, m])
						}
					}
				}
			};
			f.bind("mouseup", function(m) {
				if (d.Touch) {
					f.unbind("mouseup")
				} else {
					j(m)
				}
			}).bind("mousemove", function(m) {
				if (d.IsOldIE()) {
					return
				}
				d.TriggerEvent(d.GetAbsolutePosition(m), d.GetSectionUnderMouse(m))
			});
			if ("ontouchstart" in document.documentElement && jQuery().addSwipeEvents) {
				f.addSwipeEvents().bind("tap", function(m, r) {
					d.Touch = true;
					var q = {
						pageX: r.currentX,
						pageY: r.currentY
					};
					var p = d.GetAbsolutePosition(q);
					var o = d.GetSectionUnderMouse(q);
					if (o) {
						var n = e.Sections[o];
						if (n.Selected) {
							d.Wrapper.trigger("OnClick", [p, n])
						}
					}
					m.stopPropagation();
					m.preventDefault()
				}).bind("doubletap", function(m, n) {
					d.Touch = true;
					j({
						pageX: n.currentX,
						pageY: n.currentY
					});
					m.stopPropagation();
					m.preventDefault()
				})
			}
			d.Wrapper.bind("OnMouseOver", d.OnMouseOver);
			d.Wrapper.bind("OnMouseOut", d.OnMouseOut);
			d.Wrapper.bind("OnClick", d.OnClick);
			d.Wrapper.bind("OnMouseMove", d.OnMouseMove);
			d.Wrapper.bind("OnReset", d.OnReset);
			d.SetCenter(new a.Map.Point(0, 0));
			return this
		},
		AddMapControl: function(h, f, g) {
			c("<div>").addClass("tuMapControl").html(h).appendTo(d.ControlsContainer).click(function() {
				var i = true;
				if (g) {
					if (c(this).hasClass("tuMapControlSelected") || c(this).hasClass("tuMapControlBlink")) {
						c(this).removeClass("tuMapControlSelected");
						c(this).removeClass("tuMapControlBlink");
						i = false
					} else {
						c(this).addClass("tuMapControlSelected")
					}
				}
				f(i)
			});
			if (e.Settings.ControlsPosition == "Inside") {
				d.ControlsContainer.css("margin-left", 0 - parseInt(d.ControlsContainer.width() / 2))
			} else {
				d.ControlsContainer.css("padding", "3px")
			}
		},
		GetAbsolutePosition: function(f) {
			var g = d.Container.offset();
			return new a.Map.Point(f.pageX - g.left, f.pageY - g.top)
		},
		GetSectionUnderMouse: function(i) {
			if (!d.IsOldIE()) {
				var h = d.Wrapper.offset();
				var g = new a.Map.Point(i.pageX - h.left, i.pageY - h.top);
				var j = d.GCanvasContext.getImageData(g.x, g.y, 1, 1).data;
				var f = "#" + ("000000" + d.RGBToHex(j[0], j[1], j[2])).slice(-6);
				return d.GhostSections[f]
			}
		},
		GenerateTiles: function() {
			for (var f = 0; f < this.Tiles.length; f++) {
				this.Tiles[f].remove()
			}
			for (var f = 0; f < d.ZoomLevel; f++) {
				for (var h = 0; h < d.ZoomLevel; h++) {
					var g = d.GetTile(new a.Map.Point(f, h), d.ZoomLevel, document);
					c(g).attr("style", "position:absolute;top:" + (h * d.TileSize) + "px;left:" + (f * d.TileSize) + "px;z-index:0;width:" + d.TileSize + "px;height:" + d.TileSize + "px;").appendTo(d.Wrapper).disableSelection();
					this.Tiles.push(c(g))
				}
			}
		},
		Trigger: function(f, g) {
			d.Wrapper.trigger(f, [null, g])
		},
		TriggerEvent: function(f, g) {
			if (g) {
				if (d.CurrentShape == null) {
					c(d.Canvas).css("cursor", "pointer");
					d.Wrapper.trigger("OnMouseOver", [f, e.Sections[g]])
				} else {
					if (d.CurrentShape.Key == g) {
						d.Wrapper.trigger("OnMouseMove", [f, e.Sections[g]])
					} else {
						d.Wrapper.trigger("OnMouseOut", [f, d.CurrentShape]);
						d.Wrapper.trigger("OnMouseOver", [f, e.Sections[g]])
					}
				}
				d.CurrentShape = e.Sections[g]
			} else {
				if (d.CurrentShape) {
					d.Wrapper.trigger("OnMouseOut", [f, d.CurrentShape]);
					c(d.Canvas).css("cursor", "move");
					d.CurrentShape = null
				}
			}
		},
		Add: function(f) {
			e.Sections[f.Key] = f;
			while (true) {
				f.SetGhostColor();
				if (!d.GhostSections[f.GhostColor]) {
					d.GhostSections[f.GhostColor] = f.Key;
					break
				}
			}
		},
		SetZoom: function(g) {
			var f = d.ZoomLevel;
			d.ZoomLevel = g;
			if (d.ZoomLevel > 4) {
				d.ZoomLevel = 4
			} else {
				if (d.ZoomLevel < 1) {
					d.ZoomLevel = 1
				}
			}
			d.Side = d.TileSize * d.ZoomLevel;
			d.Wrapper.width(d.Side).height(d.Side);
			d.GenerateTiles();
			d.Canvas.width = d.Side;
			d.Canvas.height = d.Side;
			d.CanvasContext.clearRect(0, 0, d.Side, d.Side);
			if (!d.IsOldIE()) {
				d.GCanvas.width = d.Side;
				d.GCanvas.height = d.Side;
				d.GCanvasContext.clearRect(0, 0, d.Side, d.Side);
				d.GCanvasContext.scale(d.ZoomLevel, d.ZoomLevel);
				d.CanvasContext.scale(d.ZoomLevel, d.ZoomLevel)
			} else {
				d.CanvasContext.scale(d.ZoomLevel / f, d.ZoomLevel / f)
			}
			d.SetCenter(new a.Map.Point(d.Center.x * d.ZoomLevel / f, d.Center.y * d.ZoomLevel / f));
			d.Draw()
		},
		GetCenter: function(f) {
			var g = e.Sections[f];
			if (g) {
				return g.GetCenter()
			}
		},
		ZoomIn: function() {
			d.SetZoom(d.ZoomLevel + 1)
		},
		ZoomOut: function() {
			d.SetZoom(d.ZoomLevel - 1)
		},
		Translate: function(g) {
			if (d.TranslatePos.x > 0) {
				d.TranslatePos.x = (d.Wrapper.width() < d.Container.width() ? (d.Container.width() - d.Wrapper.width()) / 2 : 0);
				g = false
			} else {
				if (d.TranslatePos.x + d.Wrapper.width() - d.Container.width() < 0) {
					d.TranslatePos.x = d.Container.width() - d.Wrapper.width();
					g = false
				}
			} if (d.TranslatePos.y > 0) {
				d.TranslatePos.y = (d.Wrapper.height() < d.Container.height() ? (d.Container.height() - d.Wrapper.height()) / 2 : 0);
				g = false
			} else {
				if (d.TranslatePos.y + d.Wrapper.height() - d.Container.height() < 0) {
					d.TranslatePos.y = d.Container.height() - d.Wrapper.height();
					g = false
				}
			}
			d.Wrapper.css("left", d.TranslatePos.x + "px").css("top", d.TranslatePos.y + "px");
			if (!g) {
				var f = new a.Map.Point(d.Container.width() / 2, d.Container.height() / 2);
				var h = new a.Map.Point(d.Wrapper.width() / 2, d.Wrapper.height() / 2);
				d.Center = new a.Map.Point(f.x - h.x - d.TranslatePos.x, f.y - h.y - d.TranslatePos.y)
			}
		},
		SetCenter: function(h) {
			d.Center = h;
			var f = new a.Map.Point(d.Container.width() / 2, d.Container.height() / 2);
			var g = new a.Map.Point(d.Wrapper.width() / 2, d.Wrapper.height() / 2);
			d.TranslatePos = new a.Map.Point(f.x - g.x - h.x, f.y - g.x - h.y);
			d.Translate(true)
		},
		Draw: function() {
			for (var f in e.Sections) {
				var g = e.Sections[f];
				if (g.hasOwnProperty("Draw")) {
					g.Draw()
				}
			}
		},
		RGBToHex: function(i, h, f) {
			if (i > 255 || h > 255 || f > 255) {
				throw "Invalid Color Component"
			}
			return ((i << 16) | (h << 8) | f).toString(16)
		},
		HexToRGB: function(g) {
			var f = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(g);
			return f ? {
				r: parseInt(f[1], 16),
				g: parseInt(f[2], 16),
				b: parseInt(f[3], 16)
			} : null
		}
	};
	var a = a || {
		Map: {}
	};
	a.Map.Section = function(f) {
		c.extend(this, f);
		this.Quantity = 0;
		this.MinPrice = 9007199254740992;
		this.MaxPrice = 0;
		this.MinPriceValue = "";
		this.MaxPriceValue = "";
		this.Style = {};
		c.extend(this.Style, (this.Active ? e.Settings.NormalStyle : e.Settings.InactiveStyle));
		this.Selected = false;
		this.Mappings = [];
		this.Coords = [];
		this.Markers = [];
		var g = this;
		c.each(this.Coordinates, function(i, h) {
			g.Coords.push(new a.Map.Point(h[0], h[1]))
		});
		delete this.Coordinates;
		this.GetOpaqueColor = function(j, h) {
			if (h == 1) {
				return j
			} else {
				var i = d.HexToRGB(j);
				j = "rgba(" + i.r + "," + i.g + "," + i.b + "," + h + ")";
				return j
			}
		};
		this.Draw = function() {
			this.DrawOnContext(d.CanvasContext, this.Style);
			if (!d.IsOldIE()) {
				this.DrawOnContext(d.GCanvasContext, {
					fillColor: this.GhostColor,
					fillOpacity: 1
				})
			}
		};
		this.IsStyleChanged = function(h) {
			if (this.Style.fillColor == h.fillColor && this.Style.fillOpacity == h.fillOpacity && this.Style.strokeColor == h.strokeColor && this.Style.strokeWeight == h.strokeWeight) {
				return false
			}
			return true
		};
		this.GetCenter = function() {
			var h = 0,
				j = 0,
				i = 0;
			c.each(this.Coords, function(k, l) {
				i++;
				h += l.x * d.ZoomLevel;
				j += l.y * d.ZoomLevel
			});
			h = h / i;
			j = j / i;
			return new a.Map.Point(h, j)
		};
		this.GetCorner = function(m, i) {
			if (i == "Dynamic") {
				return m
			}
			var h = 0;
			var k = null;
			var j = 100000;
			var n = 500 * d.ZoomLevel;
			var l = 500 * d.ZoomLevel;
			switch (i) {
				case "TopRight":
					l = -l;
					break;
				case "TopLeft":
					n = -n;
					l = -l;
					break;
				case "BottomLeft":
					n = -n;
					break
			}
			c.each(this.Coords, function(p, q) {
				var o = Math.sqrt(Math.pow(q.x - (m.x + n), 2) + Math.pow(q.y - (m.y + l), 2));
				if (o < j) {
					j = o;
					k = new a.Map.Point((q.x * d.ZoomLevel) + d.TranslatePos.x, (q.y * d.ZoomLevel) + d.TranslatePos.y)
				}
			});
			return k
		};
		this.AddMarker = function(h, i, l) {
			var j = this;
			var k = new Image();
			k.src = h + "?" + new Date().getTime();
			k.onload = function() {
				j.Markers.push({
					Image: k,
					Point: i,
					Adjustment: l
				});
				d.CanvasContext.drawImage(k, i.x - l.x, i.y - l.y)
			}
		};
		this.RemoveMarker = function(i) {
			for (var h = 0; h < this.Markers.length; h++) {
				if (this.Markers[h].Point.x == i.x && this.Markers[h].Point.y == i.y) {
					this.Markers.splice(h, 1);
					break
				}
			}
			this.Clear(d.CanvasContext);
			this.DrawOnContext(d.CanvasContext, this.Style)
		};
		this.SetStyle = function(h) {
			if (!this.IsStyleChanged(h)) {
				return
			}
			if (d.IsOldIE()) {
				c.extend(this.Style, h);
				var i = document.getElementById(this.Key);
				if (i) {
					i.filled = (this.Style.fillOpacity > 0);
					if (typeof(i.fill) != undefined && i.fill != null) {
						i.fill.opacity = (this.Style.fillOpacity * 100) + "%"
					}
					i.fillcolor = this.Style.fillColor;
					i.strokecolor = this.Style.strokeColor;
					i.strokeweight = this.Style.strokeWeight;
					i.stroked = (this.Style.strokeWeight > 0)
				}
			} else {
				this.Clear(d.CanvasContext);
				c.extend(this.Style, h);
				this.DrawOnContext(d.CanvasContext, this.Style)
			}
		};
		this.Clear = function(h) {
			h.save();
			h.globalCompositeOperation = "destination-out";
			this.DrawOnContext(d.CanvasContext, {
				fillColor: "#FFFFFF",
				strokeColor: "#FFFFFF",
				strokeWeight: this.Style.strokeWeight,
				fillOpacity: 1
			});
			h.restore()
		};
		this.DrawOnContext = function(k, j) {
			k.save();
			k.beginPath();
			k.moveTo(this.Coords[0].x, this.Coords[0].y);
			for (var i = 0; i < this.Coords.length; i++) {
				k.lineTo(this.Coords[i].x, this.Coords[i].y)
			}
			k.closePath();
			if (d.IsOldIE()) {
				k.fillStyle = this.GetOpaqueColor(j.fillColor, j.fillOpacity);
				k.lineWidth = j.strokeWeight;
				k.strokeStyle = j.strokeColor;
				k.stroke(true, d.CallbackFunctionId, this.Key)
			} else {
				if (j.fillOpacity > 0) {
					k.fillStyle = this.GetOpaqueColor(j.fillColor, j.fillOpacity);
					k.fill()
				}
				if (j.strokeWeight > 0) {
					k.lineWidth = j.strokeWeight;
					k.strokeStyle = j.strokeColor;
					k.stroke()
				}
			} if (this.Markers.length > 0 && j.fillColor != this.GhostColor) {
				for (var i = 0; i < this.Markers.length; i++) {
					var h = this.Markers[i];
					k.drawImage(h.Image, h.Point.x - h.Adjustment.x, h.Point.y - h.Adjustment.y)
				}
			}
			k.restore()
		};
		this.SetGhostColor = function() {
			this.GhostColor = "#" + ("000" + (Math.random() * (1 << 24) | 0).toString(16)).substr(-6)
		}
	};
	a.Map.Point = function(f, g) {
		this.x = f;
		this.y = g
	};
	c.fn.tuMap = function(f) {
		if (e[f]) {
			if (typeof(e[f]) == "function") {
				return e[f].apply(this, Array.prototype.slice.call(arguments, 1))
			} else {
				return e[f]
			}
		} else {
			if (typeof f === "object" || !f) {
				return e.Initialize.apply(this, arguments)
			} else {
				c.error("Method " + f + " does not exist")
			}
		}
	};
	c.fn.disableSelection = function() {
		return this.each(function() {
			c(this).attr("unselectable", "on").css({
				"-webkit-touch-callout": "none",
				"-webkit-user-select": "none",
				"-khtml-user-select": "none",
				"-moz-user-select": "none",
				"-ms-user-select": "none",
				"user-select": "none"
			}).each(function() {
				this.onselectstart = function() {
					return false
				}
			})
		})
	}
})(jQuery);
