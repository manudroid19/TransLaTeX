var inputs = document.querySelectorAll( '.inputfile' );
Array.prototype.forEach.call( inputs, function( input )
{
	var label	 = input.nextElementSibling,
		labelVal = label.innerHTML;

	input.addEventListener( 'change', function( e )
	{
		var fileName = '';
		if( this.files && this.files.length > 1 ){
			fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
		}else
			fileName = e.target.value.split( '\\' ).pop();
		if( fileName ){
			label.querySelector( 'span' ).innerHTML = fileName;
			setCookie('filesize',''+e.target.files[0].size,1);
		}else
			label.innerHTML = labelVal;
	});
});
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function eraseCookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';
}
