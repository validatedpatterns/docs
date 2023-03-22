---
title: CI Status
---
<section id="main">

  <header class="major">
    <h2>Where to Start</h2>
  </header>
  <p>
    If you're new to Pacemaker or clustering in general, the best place to 
    start is <b>Clusters from Scratch</b>, which walks you step-by-step through 
    the installation and configuration of a high-availability cluster with 
    Pacemaker. It even makes common configuration mistakes so that it can
    demonstrate how to fix them.

[![Azure](https://img.shields.io/endpoint?url=https%3A%2F%2Fstorage.googleapis.com%2Fhcp-results%2Fmcgitops-azr-ci.json)](https://storage.googleapis.com/hcp-results/mcgitops-azr-ci.json)

  </p>

  <?php

   //https://storage.googleapis.com/hcp-results/mcgitops-azr-ci.json
   function get_badges($url) {
      $badges = array();
      $server_output = file_get_contents($url)
      $xml = simplexml_load_string($server_output);
      $children = $xml->children()
      foreach ($children as $child) {
      	      if ($child->name() == "Contents") {
	      	 $badges[] = $child->Key
	      }
      }
      return array_reverse(array_unique($badges))
   }

   function decompose_badges($files, $field) {
      $results = array();
      foreach ($files as $file) {
   	    $fields = explode("-", $file)
	    if ( $field == "pattern" ) {
	    	    $patterns[] = $fields[0]
	    } elif { $field == "platform" ) {
	    	    $patterns[] = $fields[1]
            }		    
      }
      return array_unique($results)
   }

   function doc_version_heading($base, $version) {
     $title = file_get_contents("$base/title-$version.txt");
     if (empty($title)) {
       $title = $version;
     }
   }

   function sphinx_docs_for_version($base, $version) {
     echo "  <section class='docset'>\n";
     doc_version_heading($base, $version);

     /* poor choice of name for style ... */
     echo "    <table class=\"publican-doc\">\n";
     foreach (glob("$base/$version/*") as $filename) {
       $book = basename($filename);
       $formats = glob("$base/$version/$book/*");
       if (!empty($formats)) {
           echo "      <tr>\n";
           echo "        <td>" . str_replace("_", " ", $book) . "</td>\n";
           echo "        <td>";

           foreach ($formats as $format) {
               $format_name = basename($format);
               echo " [<a class='doclink' href='$format/'>" . $format_name . "</a>]";
           }
           echo "</td>\n";
           echo "      </tr>\n";
       }
     }
     echo "    </table>\n";
     echo "  </section>\n";
   }

   function publican_docs_for_version($base, $version, $langs) {
     echo "  <section class='docset'>\n";
     doc_version_heading($base, $version);

     $books = array();
     foreach (glob("$base/en-US/Pacemaker/$version/pdf/*") as $filename) {
         $books[] = basename($filename);
     }

     echo '<table class="publican-doc">';
     foreach ($books as $b) {
         foreach ($langs as $lang) {
             if (glob("$base/$lang/Pacemaker/$version/pdf/$b/*-$lang.pdf")) {
                 echo '<tr><td>'.str_replace("_", " ", $b)." ($lang)</td>";

                 echo '<td>';
                 foreach (glob("$base/$lang/Pacemaker/$version/epub/$b/*.epub") as $filename) {
                     echo " [<a class='doclink' href=$filename>epub</a>]";
                 }
                 echo "</td></tr>";
             }
         }
     }
     echo "</table>";
     echo "</section>";
   }

  echo "<header class='major'>\n<h2>All badges</h2>\n</header>";

  $bucket = "https://storage.googleapis.com/hcp-results/"
  $badges = get_badges($bucket)
  foreach ($badges as $badge) {
  	  $url = 'https://img.shields.io/endpoint?url=' . urlencode($bucket."/".$badge)
  	  echo "[![$badge]($url)]($bucket/$badge)
  }

  $patterns = decompose_badges($badges, "pattern")
  $platforms = decompose_badges($badges, "platform")

  echo "<header class='major'>\n<h2>By Pattern</h2>\n</header>";
  foreach ($patterns as $pattern) {
    echo "<header class='major'>\n<h3>$pattern</h3>\n</header>";
    foreach ($platform as $platform) {
    	  $badge = $pattern ."-". $platform ."-ci.json"
  	  $url = 'https://img.shields.io/endpoint?url=' . urlencode($bucket."/".$badge)
  	  echo "[![$badge]($url)]($bucket/$badge)
    }
    echo "<hr/>
  }

  echo "<header class='major'>\n<h2>By Platform</h2>\n</header>";
  foreach ($platform as $platform) {
      echo "<header class='major'>\n<h3>$platform</h3>\n</header>";
      foreach ($patterns as $pattern) {
    	  $badge = $pattern ."-". $platform ."-ci.json"
  	  $url = 'https://img.shields.io/endpoint?url=' . urlencode($bucket."/".$badge)
  	  echo "[![$badge]($url)]($bucket/$badge)
      }
      echo "<hr/>
  }

  ?>

</section>
