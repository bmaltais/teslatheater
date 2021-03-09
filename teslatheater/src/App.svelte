<script>
	export let name;
</script>

<main>
	<h1>Welcome to {name}!</h1>
	<p></p>
	<p><a href="https://www.youtube.com/redirect?q=https://bmaltais.github.io/"><img src=logos/fullscreen.png alt="GO FULL SCREEN" style="height:200px;"></a></p>
	<p></p>
	<p><a href="https://tv.bell.ca/"><img src=logos/bell.png alt="Bell Fibe TV" style="height:200px;"></a><a href="https://www.disneyplus.com/fr-ca/login"><img src=logos/disney.svg alt="Disney+" style="height:200px;"></a></p>
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