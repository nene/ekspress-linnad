<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="et">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Kaardirakendusekene</title>
<link rel="stylesheet" type="text/css" href="towns.css" />
<script type="text/javascript" src="js/prototype.js"></script>
<script type="text/javascript" src="js/towns.js"></script>
</head>
<body>

<div id="container">


<h1>Linnad</h1>

<div id="header">
<h2>Tegevused:</h2>
<ul>
    <li><button id="move" accesskey="l" class="selected" title="Linnu saad hiirega liigutada. Linna nimele või vahemaale klikkides saad seda muuta. (L)"><span>L</span>iiguta</button></li>
    <li><button id="add-town" accesskey="i" title="Kliki kaardil tühja koha peal, et tekitada sinna uus linn. (I)">Lisa l<span>i</span>nn</button></li>
    <li><button id="add-distance" accesskey="v" title="Kliki kõigepealt ühe ja siis teise linna peal, et luua nende vahele ühendus. (V)">Lisa <span>v</span>ahemaa</button></li>
    <li><button id="delete" accesskey="k" title="Kliki linna või vahemaa peal, et see kustutada. (K)"><span>K</span>ustuta</button></li>
</ul>
<form action="" method="post">
<p><input type="checkbox" name="enable-help" id="enable-help"
{if $enableHelp} checked="checked" {/if}
/><label for="enable-help">abiinfo</label>
<input type="submit" name="load" id="load-button" value="Lae" title="Lae algne seis" />
<input type="submit" name="save" id="save-button" value="Salvesta" title="Salvesta praegune seis" />
<input type="hidden" name="xml" id="xml" value="" /></p>
</form>
</div>


<div id="towns">
    <ul>
    {foreach from=$towns item=town}
        <li id="v{$town.id}" style="left:{$town.x}px; top:{$town.y}px;"><span>{$town.name|escape:'html'}</span></li>
    {/foreach}
    </ul>
</div>


<div id="distances">
<h2>Vahekaugused</h2>

<dl>
{foreach from=$distances item=distance}
<dt><span class="v{$distance.start_id}">{$distance.start_name|escape:'html'}</span> –
    <span class="v{$distance.end_id}">{$distance.end_name|escape:'html'}</span></dt>
<dd>{$distance.length} km</dd>
{/foreach}
</dl>

</div>


<p id="footer">Rene Saarsoo pisikene kaardirakendus — Ekspress Internet OÜ katseülesanne.</p>

</div>

</body>
</html>

