define('HeaderView',[
	'jquery',
	'underscore',
	'backbone',
	'text!templates/header.html'
], function($, _, Backbone, tpl){
	var HeaderView;

	HeaderView = Backbone.View.extend({
		initialize : function(){
			var ajaxLoader;

			this.template = _.template(tpl);

			$('body').ajaxStart(function(){
				ajaxLoader = ajaxLoader || $('.ajax-loader');
				ajaxLoader.show();
			}).ajaxStop(function(){
				ajaxLoader.fadeOut('fast');
			});
		},
		render : function(){
			var that = this,
				tmpl;

			tmpl = that.template();

			$(that.el).html(tmpl);
			return this;
		}
	})

	return HeaderView;
});
