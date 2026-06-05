# Code-first design process — pas de Figma avant le code

Tolbi dispose d'un Design System (`@abi-shai/tolbi-design-system`) et de maquettes Figma pour les flows existants, ce qui pourrait laisser croire que le processus est design-first. Ce n'est pas le cas.

Le flux retenu est : objectif ou feature → code directement, en s'appuyant sur les fichiers `context/` (product, design-philosophy, design-system, voice-and-tone), le DS, et les composants déjà construits comme base visuelle. Les maquettes Figma existantes documentent l'existant — elles ne précèdent pas les nouvelles features.

Ce choix est délibéré : il permet d'itérer en continu avec des agents IA sans friction de handoff design → dev, et de maintenir une source de vérité unique dans le code et les fichiers de contexte plutôt que dans deux artefacts (Figma + code) qui divergent.
