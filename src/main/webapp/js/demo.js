/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global $ */
'use strict';

function _error(xhr) {
  $('.error').show();
  var response = JSON.parse(xhr.responseText);
  console.log(response.error);
  $('.error h4').text(response.error || 'Internal server error.');
}


$(document).ready(function() {
  // namespace variables
  var queries = [];
  var query = null;

  // jQuery nodes
  var $serviceResults = $('.service--results'),
    $standardResults = $('.standard--results'),
    $template = $('.result--template'),
    $output = $('.output'),
    $input_generated = $('.input--container-generated'),
    $input_user = $('.input--container-user'),
    $query = $('#query');

  // Hide sections
  $output.hide();
  $input_generated.hide();
  $input_user.hide();
  
  // Load base content
  $.get('data/queries.json').then(function(data){
    queries = JSON.parse(data).queries;
  }, _error);

  /**
   * Event handler for reset button
   */
  $('.reset-button').click(function() {
    location.reload();
  });
  
  $('#questionSearchButton').click(function(){	  
		$('.error').hide();
		$output.hide();
		
	    var userQuery = new Object();
	    userQuery.query = $('#questionText').val();
	    userQuery.id = -1;
		    
	    $.ajax('api/query', { 
	    	data : JSON.stringify(userQuery),
	    	contentType : 'application/json',
	    	type : 'POST'
	    }).then(function(response) {
	    
	      // standard results - solr
	      $standardResults.empty();
	      response.solrResults.map(createResultNode.bind(null, $template, false))
	      .forEach(function(e){
	        $standardResults.append(e);
	      });

	      // service results - solr + ranker
	      $serviceResults.empty();
	      response.rankedResults.map(createResultNode.bind(null, $template, true))
	      .forEach(function(e){
	        $serviceResults.append(e);
	      });

	      $output.show();
	    }, _error);

	    function createResultNode($template, showRanking, result, index) {
	      var node = $template.last().clone().show();

	      node.find('.results--item-text').prepend(result.title);
	      node.find('.results--item-details').text(result.body);

	      // ranking result
	      if (showRanking){
	        var iconClass = 'results--increase-icon_UP icon-arrow_up';
	        var rank = result.solrRank - index -1;
	        if (rank < 0)
	          iconClass = 'results--increase-icon_DOWN icon-arrow_down';

	        node.find('.results--increase-icon').addClass(iconClass);
	        node.find('.results--increase-value').text(rank > 0 ? rank : Math.abs(1 + index - result.solrRank));
	      } else {
	        node.find('.results--item-rank').remove();
	      }

	      node.find('.results--item-score-bar').each(function(i, score) {
	        if ((result.relevance - i - 1) >= 0)
	          $(score).addClass('green');
	      });

	      var $moreInfo = node.find('.results--more-info');
	      node.find('.results--see-more').click(function() {
	        if ($moreInfo.css('display') === 'none')
	          $moreInfo.fadeIn('slow');
	        else
	          $moreInfo.fadeOut(500);
	      });
	      return node;
	    }
	    
  });

  $('.input--question-user-entered').click(function(){
	$('.error').hide();  
	$output.hide();
	$input_generated.hide();
	$input_user.show();
  });
  
  $('.input--question-generator').click(function(){
	$('.error').hide();
	$output.hide();
	$input_user.hide();
	$input_generated.show();
	
	query = queries[Math.floor(Math.random() * queries.length)];
    $query.text(query.query);
    
    $.ajax('api/query', { 
    	data : JSON.stringify(query),
    	contentType : 'application/json',
    	type : 'POST'
    }).then(function(response) {
    
      // standard results - solr
      $standardResults.empty();
      response.solrResults.map(createResultNode.bind(null, $template, false))
      .forEach(function(e){
        $standardResults.append(e);
      });

      // service results - solr + ranker
      $serviceResults.empty();
      response.rankedResults.map(createResultNode.bind(null, $template, true))
      .forEach(function(e){
        $serviceResults.append(e);
      });

      $output.show();
    }, _error);

    function createResultNode($template, showRanking, result, index) {
      var node = $template.last().clone().show();

      node.find('.results--item-text').prepend(result.title);
      node.find('.results--item-details').text(result.body);


      // ranking result
      if (showRanking){
        var iconClass = 'results--increase-icon_UP icon-arrow_up';
        var rank = result.solrRank - index -1;
        if (rank < 0)
          iconClass = 'results--increase-icon_DOWN icon-arrow_down';

        node.find('.results--increase-icon').addClass(iconClass);
        node.find('.results--increase-value').text(rank > 0 ? rank : Math.abs(1 + index - result.solrRank));
      } else {
        node.find('.results--item-rank').remove();
      }

      node.find('.results--item-score-bar').each(function(i, score) {
        if ((result.relevance - i - 1) >= 0)
          $(score).addClass('green');
      });

      var $moreInfo = node.find('.results--more-info');
      node.find('.results--see-more').click(function() {
        if ($moreInfo.css('display') === 'none')
          $moreInfo.fadeIn('slow');
        else
          $moreInfo.fadeOut(500);
      });
      return node;
    }
  });	
});