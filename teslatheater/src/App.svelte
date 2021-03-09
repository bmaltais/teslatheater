<script>
	export let name;
</script>

<main>
	<h1>Welcome to {name}!</h1>
	<p></p>
	<p><a href="https://www.youtube.com/redirect?q=http://teslatheater.z22.web.core.windows.net/">GO FULL SCREEN</a></p>
	<p></p>
	<p><a href="https://tv.bell.ca/"><img src=logos/bell.png alt="Bell Fibe TV" style="width:200px;"></a></p>
	<p></p>
	<p><a href="https://www.disneyplus.com/fr-ca/login"><img src=logos/disney.jpg alt="Disney+" style="width:200px;"></a></p>
	<p></p>
	<p><a href="https://videotron.com/helix/tele-web"><img src=logos/helix.jpg alt="DVideotron HELIX" style="width:200px;"></a></p>
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

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>