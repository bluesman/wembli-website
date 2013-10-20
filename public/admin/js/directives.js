'use strict';

/* Directives */
angular.module('adminApp.directives', []).

directive('keenMetric', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transculde) {
        return function(scope, element, attr, controller) {
          console.log(attr);

          var args = {};
          if (attr.analysisType) {
            args.analysisType = attr.analysisType;
          }
          if (attr.timeframe) {
            args.timeframe = attr.timeframe;
          }
          if (attr.targetProperty) {
            args.targetProperty = attr.targetProperty;
          }
          if (attr.groupBy) {
            args.groupBy = attr.groupBy;
          }
          if (attr.filter) {
            args.filters = attr.filter;
          }

          console.log(args);
          Keen.onChartsReady(function() {
            var metric = new Keen.Metric(attr.eventCollection, args);
            metric.draw(document.getElementById(attr.id));
          });
        }
      }
    }
  }
]).

directive('keenSeries', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transculde) {
        return function(scope, element, attr, controller) {
          console.log(attr);

          var args = {};
          if (attr.analysisType) {
            args.analysisType = attr.analysisType;
          }
          if (attr.timeframe) {
            args.timeframe = attr.timeframe;
          }
          if (attr.targetProperty) {
            args.targetProperty = attr.targetProperty;
          }
          if (attr.interval) {
            args.interval = attr.interval;
          }
          console.log(args);
          Keen.onChartsReady(function() {
            var series = new Keen.Series(attr.eventCollection, args);
            series.draw(document.getElementById(attr.id));
          });
        }
      }
    }
  }
]).

directive('appVersion', ['version',
  function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }
]);
