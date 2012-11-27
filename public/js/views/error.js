define('ErrorView',[
	'jquery',
	'underscore',
	'backbone',
	'text!templates/error.html'
], function($, _, Backbone, tpl){
	var ErrorView;

	ErrorView = Backbone.View.extend({
		initialize : function(){
			this.template = _.template(tpl);
		},
		render : function(error){
			console.log('Error render');
			var tmpl = this.template({error: error});

			$(this.el).html(tmpl);
			return this;
		}
	});

	return ErrorView;
});