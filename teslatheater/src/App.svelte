<script>
	export let name;
</script>

<main>
	<p>
		<a href="https://www.youtube.com/redirect?q=https://bmaltais.github.io/" class="img-small"><img style="display:none" id="img1" src=logos/fullscreen.png alt="GO FULL SCREEN"></a> <!--only display this if the variable c == true in the script-->
	</p>
	<p></p>
	<p>
		<a href="https://www.crave.ca/en"><img src=logos/crave.png alt="Crave" align="middle" hspace="20" vspace="10"></a>
		<a href="https://www.disneyplus.com/fr-ca/login"><img src=logos/disney.svg alt="Disney+" align="middle" hspace="20" vspace="10"></a>
		<a href="https://www.crave.ca/en/hbo"><img src=logos/hbogo.gif alt="HBO" align="middle" hspace="20" vspace="10"></a>
		<a href="https://tv.bell.ca/"><img src=logos/bell.png alt="Bell Fibe TV" align="middle" hspace="20" vspace="10"></a>
		<a href="https://netflix.com/"><img src=logos/netflix.png alt="Tubi TV" align="middle" hspace="20" vspace="10"></a>
		<a href="https://www.paramountplus.com/ca/"><img src=logos/paramountplus.png alt="Paramount+" align="middle" hspace="20" vspace="10"></a>
		<a href="https://ici.tou.tv/"><img src=logos/toutv.png alt="TouTV" align="middle" hspace="20" vspace="10"></a>
		<a href="https://tubitv.com/"><img src=logos/tubitv.png alt="Tubi TV" align="middle" hspace="20" vspace="10"></a>
		<a href="https://www.twitch.com"><img src=logos/twitch.png alt="Twitch" align="middle" hspace="20" vspace="10"></a>
		<a href="https://tv.virginmobile.ca/"><img src=logos/virginmobile.svg alt="Twitch" align="middle" hspace="20" vspace="10"></a>
		<a href="https://www.youtube.com"><img src=logos/youtube.jpg alt="Youtube" align="middle" hspace="20" vspace="10"></a>
	</p>
	<p id="demo1"></p>
	<script>
		var w = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;

		var h = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;

		document.getElementById("demo1").innerHTML = "Browser inner window width: " + w + ", height: " + h + ".";

		if(w <= 1500) {
				document.getElementById( "img1" ).style.display = "inline"; 
		}
	</script>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	img {
    width: 20%;
    height: auto;
	}

	.img-large, .img-large img {
    width: 50%;
    height: auto;
	}

	.img-small, .img-small img {
    width: 5%;
    height: 5%;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>