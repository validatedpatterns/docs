#!/usr/bin/env ruby

# This reads a yaml file and outputs all yaml leaf objects
# as ascii doc variables. The idea is to read in the pattern-metadata.yaml
# file and output it wholesale into a file so it can be consumed
# by asciidoc

require 'yaml'

if ARGV.length != 1
  puts "Please run: #{$0} <metadata-file.yaml>"
  exit(1)
end

def flatten_hash(hash, prefix = "")
  flat_hash = {}
  hash.each do |key, value|
    new_key = prefix.empty? ? key.to_s : "#{prefix}_#{key}"
    if value.is_a?(Hash)
      flat_hash.merge!(flatten_hash(value, new_key))
    else
      flat_hash[new_key] = value
    end
  end
  flat_hash
end

def process_yaml(file_path)
  begin
    yaml_data = YAML.load_file(file_path)
    flat_data = flatten_hash(yaml_data)

    puts "// This file has been generated automatically from the pattern-metadata.yaml file"
    puts "// Do not edit manually!"
    # Print each key-value pair with a leading column to define an
    # ascii doc variable
    flat_data.each do |key, value|
      puts ":#{key}: #{value}"
    end
  rescue Errno::ENOENT
    puts "Error: File not found at '#{file_path}'. Please provide a valid file path."
  rescue Psych::SyntaxError => e
    puts "Error: Syntax error in YAML file. Details:"
    puts e.message
  end
end

process_yaml(ARGV[0])
