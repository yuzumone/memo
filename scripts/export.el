(setq user-emacs-directory
      (expand-file-name ".emacs.d-batch/" default-directory))
(require 'package)
(add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/") t)
(package-refresh-contents)
(package-initialize)
(dolist (pkg '(org org-roam ox-hugo))
    (unless (package-installed-p pkg)
      (package-install pkg)))

(require 'org-roam)
(require 'ox-hugo)

;;; roam
(setopt org-roam-db-location "./org-roam.db")
(setopt org-id-locations-file "./.org-id-locations")
(setopt org-roam-directory (expand-file-name "org/roam" default-directory))
(org-roam-db-sync)

;;; ox-hugo
(defun zeeros/fix-doc-path (path)
  (file-name-nondirectory path))

(defun collect-backlinks-string (backend)
  (when (org-roam-node-at-point)
    (goto-char (point-max))
    ;; Add a new header for the references
    (let* ((backlinks (org-roam-backlinks-get (org-roam-node-at-point))))
      (when (> (length backlinks) 0)
        (insert "\n\n* Backlinks\n")
        (dolist (backlink backlinks)
          (message (concat "backlink: " (org-roam-node-title (org-roam-backlink-source-node backlink))))
          (let* ((source-node (org-roam-backlink-source-node backlink))
                 (node-file (org-roam-node-file source-node))
                 (file-name (file-name-nondirectory node-file))
                 (title (org-roam-node-title source-node)))
            (insert
             (format "- [[./%s][%s]]\n" file-name title))))))))

(defun export-all (&optional org-files-root-dir dont-recurse)
  "Export all Org files"
  (let* ((org-files-root-dir (or org-files-root-dir default-directory))
         (dont-recurse (or dont-recurse (and current-prefix-arg t)))
         (search-path (file-name-as-directory (expand-file-name org-files-root-dir)))
         (org-files (if dont-recurse
                        (directory-files search-path :full "\.org$")
                      (directory-files-recursively search-path "\.org$")))
         (num-files (length org-files))
         (cnt 1))
    (if (= 0 num-files)
        (message (format "No Org files found in %s" search-path))
      (progn
        (message (format (if dont-recurse
                             "[ox-hugo/export-all] Exporting %d files from %S .."
                           "[ox-hugo/export-all] Exporting %d files recursively from %S ..")
                         num-files search-path))
        (dolist (org-file org-files)
          (with-current-buffer (find-file-noselect org-file)
            (message (format "[ox-hugo/export-all file %d/%d] Exporting %s" cnt num-files org-file))
            (org-hugo-export-wim-to-md :all-subtrees)
            (setq cnt (1+ cnt))))
        (message "Done!")))))

(defun export-to-starlight  ()
  (export-all (expand-file-name "org/roam" default-directory) nil))

(setopt org-hugo-front-matter-format "yaml")
(setopt org-hugo-headline-anchor nil)
(setopt org-hugo-base-dir (expand-file-name "src/content" default-directory))
(setopt org-hugo-content-folder "docs")
(setopt org-hugo-section "memos")
(add-hook 'org-export-before-processing-hook 'collect-backlinks-string)
(advice-add 'org-export-resolve-id-link :filter-return #'zeeros/fix-doc-path)
